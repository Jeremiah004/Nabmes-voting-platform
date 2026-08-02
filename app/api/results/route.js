import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: candidates, error: candError } = await supabase
    .from("candidates")
    .select("id, election, position, level, name, display_order");

  const { data: ballots, error: ballotError } = await supabase
    .from("ballots")
    .select("election, position, candidate_id");

  if (candError || ballotError) {
    console.error(candError || ballotError);
    return NextResponse.json({ error: "Couldn't load results." }, { status: 500 });
  }

  const counts = new Map();
  for (const b of ballots) {
    counts.set(b.candidate_id, (counts.get(b.candidate_id) || 0) + 1);
  }

  const byRace = new Map();
  for (const c of candidates) {
    const raceKey = `${c.election}|${c.position}`;
    if (!byRace.has(raceKey)) {
      byRace.set(raceKey, { election: c.election, position: c.position, level: c.level, candidates: [] });
    }
    byRace.get(raceKey).candidates.push({ id: c.id, name: c.name, votes: counts.get(c.id) || 0 });
  }

  const races = Array.from(byRace.values()).map((race) => {
    const sorted = [...race.candidates].sort((a, b) => b.votes - a.votes);
    const winnersNeeded = race.election === "SRC" ? 2 : 1;
    const totalVotes = sorted.reduce((sum, c) => sum + c.votes, 0);
    const withWinner = sorted.map((c, i) => ({ ...c, isLeading: i < winnersNeeded }));
    return { ...race, candidates: withWinner, totalVotes };
  });

  races.sort((a, b) => {
    if (a.election !== b.election) return a.election === "CEC" ? -1 : 1;
    return a.position.localeCompare(b.position);
  });

  return NextResponse.json({ races });
}
