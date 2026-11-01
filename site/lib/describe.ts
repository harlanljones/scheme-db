import { gapsAt, pos, type LitePlay } from './field';
import { ROLE_WORDS } from './format';

/** The text alternative of a field: the time, how to read the marks, the labeled players and the ringed ones. */
export function describeField(props: { play: LitePlay; against?: LitePlay; againstName?: string; t: number; focus?: string[] }): string {
  const { play, against, againstName, t, focus = [] } = props;
  const hot = against ? gapsAt(play, against, t) : [];
  const where = (id: string): string => {
    const track = play.tracks.find((candidate) => candidate.id === id);
    if (!track) return '';
    const p = pos(track, t);
    const rel = p.y >= 0 ? 'past' : 'behind';
    return `${id}, ${ROLE_WORDS[track.role] ?? 'player'}, is ${p.x.toFixed(0)} yards from the left sideline and ${Math.abs(p.y).toFixed(1)} yards ${rel} the line`;
  };
  const focusText = focus.map(where).filter(Boolean);
  return (
    `${play.name}, ${t.toFixed(1)} seconds after the snap. Offense attacks up the page. Offense is filled amber marks and defense is hollow blue rings. The heavy line is the line of scrimmage. ` +
    (focusText.length ? `${focusText.join('. ')}. ` : '') +
    (against
      ? hot.length
        ? `${hot.join(', ')} ${hot.length === 1 ? 'stands' : 'stand'} more than 1 yard from ${hot.length === 1 ? 'where that player is' : 'where they are'} in ${againstName ?? 'the other play'}, ringed in red.`
        : `No player is more than 1 yard from ${againstName ?? 'the other play'}.`
      : '')
  );
}
