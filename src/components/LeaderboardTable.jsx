import { useData } from "../data/DataProvider.jsx";
import "./LeaderboardTable.css";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardTable() {
  const { leaderboard, currentUser } = useData();

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="card lb-table-wrap">
        <p className="lb-empty">No players on the leaderboard yet.</p>
      </div>
    );
  }

  const lastShown = leaderboard[leaderboard.length - 1];
  const pointsBehind = lastShown.points - currentUser.balance;
  const userUp = currentUser.changePct >= 0;

  return (
    <div className="card lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th className="lb-col-detail">Year &amp; Major</th>
            <th className="lb-num">Trend</th>
            <th className="lb-num">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((p) => (
            <tr key={p.rank}>
              <td className="lb-rank">
                <span className="lb-medal">{MEDALS[p.rank] ?? ""}</span>
                {p.rank}
              </td>
              <td>{p.name}</td>
              <td className="muted lb-col-detail">{p.detail}</td>
              <td className={`lb-num lb-trend--${p.trend}`}>{p.trend === "up" ? "▲" : "▼"}</td>
              <td className="lb-num lb-points">{p.points.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="lb-you-label-row">
            <td colSpan={5}>Your current position</td>
          </tr>
          <tr className="lb-you-row">
            <td className="lb-rank">
              <span className="lb-medal" />
              {currentUser.rank}
            </td>
            <td>
              {currentUser.name} <span className="lb-you-tag">You</span>
            </td>
            <td className="muted lb-col-detail">
              {pointsBehind.toLocaleString()} pts behind #{lastShown.rank}
            </td>
            <td className={`lb-num lb-trend--${userUp ? "up" : "down"}`}>
              {userUp ? "▲" : "▼"} {Math.abs(currentUser.changePct)}%
            </td>
            <td className="lb-num lb-points">{currentUser.balance.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
