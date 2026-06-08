from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from pathlib import Path

# 1. Flask App Initialization
app = Flask(__name__)

# 2. Enable CORS for all routes
CORS(app)

# Other variables and functions
stadium_avg_rate_dict = {
    "Narendra Modi Stadium, Ahmedabad": (9.760, 9.519),
    "New International Cricket Stadium, New Chandigarh": (8.747, 8.757),
    "Himachal Pradesh Cricket Association Stadium, Dharamshala": (10.667, 9.501),
    "Eden Gardens, Kolkata": (9.929, 9.771),
    "Wankhede Stadium, Mumbai": (9.415, 9.713),
    "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow": (8.737, 8.702),
    "Rajiv Gandhi International Stadium, Hyderabad": (9.510, 10.310),
    "Sawai Mansingh Stadium, Jaipur": (9.336, 9.215),
    "MA Chidambaram Stadium, Chennai": (8.456, 8.446),
    "Arun Jaitley Stadium, Delhi": (10.241, 9.800),
    "Shaheed Veer Narayan Singh International Cricket Stadium, Raipur": (9.550, 10.670),
    "ACA Stadium, Guwahati": (8.475, 8.274),
    "M Chinnaswamy Stadium, Bengaluru": (9.502, 9.684),
}

team_rating_dict = {
    "CSK": ([80, 80, 80], [80, 80, 80], 78),
    "MI": ([80, 80, 80], [80, 80, 80], 78),
    "RCB": ([80, 80, 80], [80, 80, 80], 79),
    "KKR": ([80, 80, 80], [80, 80, 80], 83),
    "SRH": ([80, 80, 80], [80, 80, 80], 77),
    "DC": ([80, 80, 80], [80, 80, 80], 74),
    "RR": ([80, 80, 80], [80, 80, 80], 80),
    "GT": ([80, 80, 80], [80, 80, 80], 80),
    "LSG": ([80, 80, 80], [80, 80, 80], 77),
    "PBKS": ([80, 80, 80], [80, 80, 80], 77),
}

DATA_DIR = Path(__file__).resolve().parent / "data"
ipl_2026_data = pd.read_excel(DATA_DIR / "IPL26.xlsx", sheet_name="Matches")

def get_projected_rate(avg_rate, opp_rating, task):
  if task == 'bat':
    return avg_rate + (80 - opp_rating) * 0.1
  elif task == 'bowl':
    return avg_rate + (opp_rating - 80) * 0.1
  
def calculate_match_rating(scoring_rate, runs_scored, projected_rate, task):
  if task == 'bat':
    return 80 + (scoring_rate - projected_rate) * 8 + (runs_scored * 0.02)
  elif task == 'bowl':
    return 80 + (projected_rate - scoring_rate) * 8 - (runs_scored * 0.02)
  
def calculate_current_rating(team_tuple: tuple):
  l = len(team_tuple[0])
  weighted_sum = 0
  weights_sum = 0
  for i in range(l):
    weighted_sum += team_tuple[0][i] * ((l-i) / l)
    weights_sum += (l-i) / l
  batting_rating = weighted_sum / weights_sum

  l = len(team_tuple[1])
  weighted_sum = 0
  weights_sum = 0
  for i in range(l):
    weighted_sum += team_tuple[1][i] * ((l-i) / l)
    weights_sum += (l-i) / l
  bowling_rating = weighted_sum / weights_sum

  return (batting_rating, bowling_rating)

# To be extracted from every row:
# team1, team2 (according to batting order)
# their_current_ratings
# scores in both ininngs
# run rate in both ininngs
# venue average score for both ininngs

def get_ratings(teams_with_ratings: tuple, ininngs_scores: tuple, run_rates_in_both_ininngs: tuple, venue_avg_rates: tuple):
  new_ratings_for_teams = [[0, 0], [0, 0]]
  for i in range(1, 3):
    if i == 1:
      projected_rate_for_batting_team = get_projected_rate(venue_avg_rates[0], teams_with_ratings[1][1], 'bat')
      projected_rate_for_bowling_team = get_projected_rate(venue_avg_rates[0], teams_with_ratings[0][0], 'bowl')
      rating_for_batting_team = min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_batting_team, 'bat'), 100)
      rating_for_bowling_team = min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_bowling_team, 'bowl'), 100)
    if i == 2:
      projected_rate_for_batting_team = get_projected_rate(venue_avg_rates[1], teams_with_ratings[0][1], 'bat')
      projected_rate_for_bowling_team = get_projected_rate(venue_avg_rates[1], teams_with_ratings[1][0], 'bowl')
      rating_for_batting_team = min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_batting_team, 'bat'), 100)
      rating_for_bowling_team = min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_bowling_team, 'bowl'), 100)
    if i == 1:
      new_ratings_for_teams[0][0] = rating_for_batting_team
      new_ratings_for_teams[1][1] = rating_for_bowling_team
    elif i == 2:
      new_ratings_for_teams[1][0] = rating_for_batting_team
      new_ratings_for_teams[0][1] = rating_for_bowling_team
  return {
    'team1': new_ratings_for_teams[0],  
    'team2': new_ratings_for_teams[1]
  }

def ratings():
  all_matches_ratings = []
  for index, match in ipl_2026_data[::-1].iterrows():
    team1 = match['Batting 1st']
    team2 = match['Batting 2nd']
    teams_with_ratings = (calculate_current_rating(team_rating_dict[team1]), calculate_current_rating(team_rating_dict[team2]))
    ininngs_scores = (match['1st Inn Score'], match['2nd Inn Score'])
    run_rates_in_both_ininngs = (match['1st Inn RR'], match['2nd Inn RR'])
    venue_avg_rates = stadium_avg_rate_dict[match['Venue']]
    match_rating = get_ratings(teams_with_ratings, ininngs_scores, run_rates_in_both_ininngs, venue_avg_rates)
    all_matches_ratings.append({f"{team1}": match_rating['team1'], f"{team2}": match_rating['team2']})
    team_rating_dict[team1][0].append(match_rating['team1'][0])
    team_rating_dict[team1][1].append(match_rating['team1'][1])
    team_rating_dict[team2][0].append(match_rating['team2'][0])
    team_rating_dict[team2][1].append(match_rating['team2'][1])

ratings()

# 3. Define a GET endpoint (Read data)
@app.route('/api/ratings_per_match', methods=['get'])
def display_ratings():
  final_ratings = {}
  for team in team_rating_dict.keys():
    rating_for_team = calculate_current_rating(team_rating_dict[team])
    final_ratings[team] = (round(rating_for_team[0], 0), round(rating_for_team[1], 0), team_rating_dict[team][2])
    
  return  jsonify(final_ratings)

# 4. Run the local development server
if __name__ == '__main__':
  app.run(debug=True, port=5000)