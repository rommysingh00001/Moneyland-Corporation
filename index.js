// index.js
import { supabase, USER_ID } from './supabase.js';

/* ---------- DYNAMIC 10 BET INPUTS ---------- */
const betFormsContainer = document.getElementById('bet-forms');
for(let i=1;i<=10;i++){
  const input = document.createElement('input');
  input.placeholder = `10-digit number for Bet ${i}`;
  input.maxLength = 10;
  input.id = `bet-${i}`;
  betFormsContainer.appendChild(input);
}

/* ---------- PLACE ALL BETS ---------- */
async function placeAllBets(){
  let bets = [];
  for(let i=1;i<=10;i++){
    const val = document.getElementById(`bet-${i}`).value;
    if(val.length !== 10){
      alert(`Bet ${i} is invalid. Enter 10 digits.`);
      return;
    }
    bets.push({ user_id: USER_ID, bet_number: val, amount:1, current_streak:0, current_multiplier:0, status:'pending' });
  }
  const { error } = await supabase.from('bets').insert(bets);
  if(error){ alert(error.message); return; }
  alert("All 10 bets placed!");
  loadBets();
}

/* ---------- LOAD USER BETS ---------- */
async function loadBets(){
  const { data } = await supabase.from('bets')
    .select("*")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: false });

  const container = document.getElementById("user-bets");
  container.innerHTML = "";

  data.forEach(bet=>{
    container.innerHTML += `
      <div class="card flex justify-between items-center">
        <div>
          <b>Number:</b> ${bet.bet_number}<br>
          <b>Amount:</b> ₹${bet.amount}
        </div>
        <div class="text-right">
          <b>Streak:</b> ${bet.current_streak}<br>
          <b>Multiplier:</b> ${bet.current_multiplier}x
        </div>
      </div>`;
  });
}

/* ---------- LIVE RESULT SUBSCRIPTION ---------- */
supabase.from("daily_results")
  .on("UPDATE", payload=>{
    const revealed = payload.new.revealed_digits || "";
    document.getElementById("live-result").innerText = revealed || "Waiting for first reveal...";
    updateBets(revealed);

    // Final winnings at 12 AM
    if(revealed.length === 10){
      showFinalWinnings();
    }
  })
  .subscribe();

/* ---------- UPDATE BETS LOGIC ---------- */
async function updateBets(revealed){
  const { data } = await supabase.from("bets").select("*").eq("user_id", USER_ID);

  data.forEach(async bet=>{
    let streak=0, maxStreak=0;
    for(let i=0;i<revealed.length;i++){
      if(bet.bet_number[i]===revealed[i]){
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      }else{ streak=0; }
    }
    let multiplier = maxStreak ? 9 * (10**(maxStreak-1)) : 0;

    await supabase.from("bets")
      .update({ current_streak:maxStreak, current_multiplier:multiplier })
      .eq("id", bet.id);
  });

  loadBets();
}

/* ---------- FINAL WINNINGS ---------- */
async function showFinalWinnings(){
  const { data } = await supabase.from("bets").select("*").eq("user_id", USER_ID);
  let total = data.reduce((sum, b)=> sum + (b.amount * b.current_multiplier), 0);
  document.getElementById("final-winnings").innerText = `🎉 Total Winnings: ₹${total.toLocaleString()}`;
}

/* ---------- INITIAL LOAD ---------- */
loadBets();
