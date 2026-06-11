from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import math
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
  "IPL": {
    "CSK": ([80, 80, 80], [80, 80, 80], 78),
    "MI": ([80, 80, 80], [80, 80, 80], 78),
    "RCB": ([80, 80, 80], [80, 80, 80], 79),
    "KKR": ([80, 80, 80], [80, 80, 80], 83),
    "SRH": ([80, 80, 80], [80, 80, 80], 77),
    "DC": ([80, 80, 80], [80, 80, 80], 74),
    "RR": ([80, 80, 80], [80, 80, 80], 80),
    "GT": ([80, 80, 80], [80, 80, 80], 80),
    "LSG": ([80, 80, 80], [80, 80, 80], 77),
    "PBKS": ([80, 80, 80], [80, 80, 80], 77)
  }
}

DATA_DIR = Path(__file__).resolve().parent / "data"
ipl_2026_data = pd.read_excel(DATA_DIR / "IPL26.xlsx", sheet_name="Matches")

def get_projected_rate(avg_rate: float, opp_rating: float, task: str):
  '''
  Calculates the projected scoring rate for a team based on the average scoring rate at the venue and the opponent's rating in the relevant task (batting or bowling).
  '''
  if task == 'bat':
    return avg_rate + (80 - opp_rating) * 0.1
  elif task == 'bowl':
    return avg_rate + (opp_rating - 80) * 0.1
  
def calculate_match_rating(scoring_rate: float, runs_scored: int, projected_rate: float, task: str):
  '''
  Calculates the match rating for a team based on their performance in the current match.
  '''
  if task == 'bat':
    return 80 + (scoring_rate - projected_rate) * 8 + (runs_scored * 0.02)
  elif task == 'bowl':
    return 80 + (projected_rate - scoring_rate) * 8 - (runs_scored * 0.02)
  
def calculate_current_rating(team_tuple: tuple):
  '''
  Calculates the current rating for a team based on their past performances. The ratings are weighted such that more recent performances have a higher weightage.
  '''
  l = len(team_tuple[0])
  weighted_sum = 0
  weights_sum = 0
  for i in range(1, l+1):
    weighted_sum += team_tuple[0][i-1] * (math.ceil(i / 7) / 7)
    weights_sum += (math.ceil(i / 7) / 7)
  batting_rating = weighted_sum / weights_sum

  l = len(team_tuple[1])
  weighted_sum = 0
  weights_sum = 0
  for i in range(1, l+1):
    weighted_sum += team_tuple[1][i-1] * (math.ceil(i / 7) / 7)
    weights_sum += (math.ceil(i / 7) / 7)
  bowling_rating = weighted_sum / weights_sum

  return (batting_rating, bowling_rating)

# To be extracted from every row:
# team1, team2 (according to batting order)
# their_current_ratings
# scores in both ininngs
# run rate in both ininngs
# venue average score for both ininngs

def get_ratings(teams_with_ratings: tuple, ininngs_scores: tuple, run_rates_in_both_ininngs: tuple, venue_avg_rates: tuple):
  '''
Calculates the match ratings for both teams in a match based on their current ratings, the scores and run rates in both innings, and the average scoring rates at the venue.
  '''
  new_ratings_for_teams = [[0, 0], [0, 0]]
  for i in range(1, 3):
    if i == 1:
      projected_rate_for_batting_team = get_projected_rate(venue_avg_rates[0], teams_with_ratings[1][1], 'bat')
      projected_rate_for_bowling_team = get_projected_rate(venue_avg_rates[0], teams_with_ratings[0][0], 'bowl')
      rating_for_batting_team = max(min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_batting_team, 'bat'), 100), 50)
      rating_for_bowling_team = max(min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_bowling_team, 'bowl'), 100), 50)
    if i == 2:
      projected_rate_for_batting_team = get_projected_rate(venue_avg_rates[1], teams_with_ratings[0][1], 'bat')
      projected_rate_for_bowling_team = get_projected_rate(venue_avg_rates[1], teams_with_ratings[1][0], 'bowl')
      rating_for_batting_team = max(min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_batting_team, 'bat'), 100), 50)
      rating_for_bowling_team = max(min(calculate_match_rating(run_rates_in_both_ininngs[i-1], ininngs_scores[i-1], projected_rate_for_bowling_team, 'bowl'), 100), 50)
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
  '''
  Calculates the match ratings for all matches in the IPL 2026 season and updates the team ratings accordingly.
  '''
  all_matches_ratings = []
  for index, match in ipl_2026_data[::-1].iterrows():
    team1 = match['Batting 1st']
    team2 = match['Batting 2nd']
    teams_with_ratings = (calculate_current_rating(team_rating_dict["IPL"][team1]), calculate_current_rating(team_rating_dict["IPL"][team2]))
    ininngs_scores = (match['1st Inn Score'], match['2nd Inn Score'])
    run_rates_in_both_ininngs = (match['1st Inn RR'], match['2nd Inn RR'])
    venue_avg_rates = stadium_avg_rate_dict[match['Venue']]
    match_rating = get_ratings(teams_with_ratings, ininngs_scores, run_rates_in_both_ininngs, venue_avg_rates)
    all_matches_ratings.append({f"{team1}": match_rating['team1'], f"{team2}": match_rating['team2']})
    team_rating_dict["IPL"][team1][0].append(match_rating['team1'][0])
    team_rating_dict["IPL"][team1][1].append(match_rating['team1'][1])
    team_rating_dict["IPL"][team2][0].append(match_rating['team2'][0])
    team_rating_dict["IPL"][team2][1].append(match_rating['team2'][1])

# Running the ratings calculation function to populate the team_rating_dict with the ratings from the IPL 2026 season
ratings()

# 3. Define a GET endpoint (Read data)
@app.route('/api/ratings_per_match', methods=['get'])
def display_ratings():
  '''
  Displays the final ratings for all teams in the IPL 2026 season.
  '''
  final_ratings = {}
  final_ratings["IPL"] = {}
  for team in team_rating_dict["IPL"].keys():
    rating_for_team = calculate_current_rating(team_rating_dict["IPL"][team])
    ovr_rating = (rating_for_team[0] * 2 + rating_for_team[1] * 2 + team_rating_dict["IPL"][team][2]) / 5
    final_ratings["IPL"][team] = (round(rating_for_team[0], 0), round(rating_for_team[1], 0), team_rating_dict["IPL"][team][2], round(ovr_rating, 2))
  
  # The ratings for the other formats are hardcoded for now, but they can be calculated in a similar way by using the match data from those formats and updating the team_rating_dict accordingly.
  final_ratings["MensT20"] = {
    "India": (87, 83, 81, 84.2),
    "Australia": (82, 84, 83, 83),
    "England": (84, 82, 82, 82.8),
    "South Africa": (85, 81, 81, 82.6),
    "New Zealand": (81, 85, 85, 83.4),
    "Pakistan": (83, 80, 77, 80.6),
    "Sri Lanka": (78, 79, 78, 78.4),
    "Afghanistan": (77, 82, 77, 79.0),
    "Bangladesh": (79, 78, 78, 78.4),
    "West Indies": (80, 77, 78, 78.4)
  }

  # Womens T20 ratings are also hardcoded for now, but they can be calculated in a similar way by using the match data from the women's T20 format and updating the team_rating_dict accordingly.
  final_ratings["WomensT20"] = {
    "Australia": (90, 88, 89),
    "England": (88, 87, 88),
    "India": (85, 86, 84),
    "New Zealand": (87, 85, 86),
    "South Africa": (84, 83, 82),
    "Pakistan": (82, 80, 78),
    "Sri Lanka": (80, 78, 77),
    "Afghanistan": (77, 82, 77),
    "Bangladesh": (79, 78, 78),
    "West Indies": (80, 77, 78)
  }

  return jsonify(final_ratings)

# 4. Run the local development server
if __name__ == '__main__':
  app.run(debug=True, port=5000)
