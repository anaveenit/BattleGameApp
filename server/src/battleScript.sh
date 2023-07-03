#!/bin/bash

# Function to calculate the attack value based on hit points
calculate_attack() {
  local base_attack=$1
  local hit_points=$2
  local min_attack=$((base_attack / 2)) # Calculate 50% of the base attack value
  local attack=$((base_attack - (hit_points / 100) * (base_attack - min_attack)))
  echo "$attack"
}

# Function to simulate a battle between two players
battle() {
  local attacker_id=$1
  local attacker_name=$2
  local attacker_attack=$3
  local attacker_hit_points=$4
  local attacker_luck=$5
  local attacker_gold=$6

  local defender_id=$7
  local defender_name=$8
  local defender_attack=$9
  local defender_hit_points=${10}
  local defender_luck=${11}
  local defender_gold=${12}

  local battle_report=""

  # Check if defender's hit points is empty or not a valid integer
  if [[ -z $defender_hit_points || ! $defender_hit_points =~ ^[0-9]+$ ]]; then
    echo "Invalid defender hit points: $defender_hit_points"
    return 1
  fi

  while [ "$attacker_hit_points" -gt 0 ] && [ "$defender_hit_points" -gt 0 ]; do
    # Attacker's turn
    local damage=$(calculate_attack "$attacker_attack" "$attacker_hit_points")
    defender_hit_points=$((defender_hit_points - damage))

    local attack_status="hit"
    if [ $((RANDOM % 100 + 1)) -le "$defender_luck" ]; then
      attack_status="miss"
    fi

    battle_report+="Attacker: $attacker_name ($attacker_id), Defender: $defender_name ($defender_id), Damage: $damage, Attack Status: $attack_status\n"

    # Check if defender's hit points reached zero
    if [ "$defender_hit_points" -le 0 ]; then
      battle_report+="Defender: $defender_name ($defender_id) has been defeated!\n"
      break
    fi

    # Swap attacker and defender
    temp_id=$attacker_id
    temp_name=$attacker_name
    temp_attack=$attacker_attack
    temp_hit_points=$attacker_hit_points
    temp_luck=$attacker_luck
    temp_gold=$attacker_gold

    attacker_id=$defender_id
    attacker_name=$defender_name
    attacker_attack=$defender_attack
    attacker_hit_points=$defender_hit_points
    attacker_luck=$defender_luck
    attacker_gold=$defender_gold

    defender_id=$temp_id
    defender_name=$temp_name
    defender_attack=$temp_attack
    defender_hit_points=$temp_hit_points
    defender_luck=$temp_luck
    defender_gold=$temp_gold
  done

  # Calculate stolen gold
  local gold_range=$((attacker_gold / 10)) # Range of gold to be stolen (10% of the attacker's gold)
  if [ "$gold_range" -eq 0 ]; then
    gold_range=1 # Avoid division by zero
  fi
  local stolen_gold=$((RANDOM % gold_range + gold_range))

  # Update gold amounts for attacker and defender
  attacker_gold=$((attacker_gold + stolen_gold))
  defender_gold=$((defender_gold - stolen_gold))

  battle_report+="Gold Stolen: $stolen_gold\n"

  # Write battle report to a file
  echo -e "$battle_report" >>battle_report.txt
}


# Array of battles
battles=(
  # Attacker ID, Attacker Name, Attacker Attack, Attacker Hit Points, Attacker Luck, Attacker Gold,
  # Defender ID, Defender Name, Defender Attack, Defender Hit Points, Defender Luck, Defender Gold
  "$@"
)



# Loop through the battles and execute them concurrently
for battle_details in "${battles[@]}"; do
  IFS='|' read -r -a params <<< "$battle_details"
  battle "${params[@]}" &
done

# Wait for all battles to finish
wait

# Display the battle reports
cat battle_report.txt
