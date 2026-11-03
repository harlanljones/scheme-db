import { LEVEL_LABELS, spotOffset, type BallSpot } from '../../src/engine/field';
import { gapsAt, movingAt, pos, type LitePlay } from './field';
import { beforeSnap, clockTenths, clockWords, list, playerWord } from './format';

const SPOT_WORDS: Record<BallSpot, string> = {
  left: 'on the left hash',
  middle: 'in the middle of the field',
  right: 'on the right hash',
};

/** The text alternative of a field: the time, how to read the marks, the labeled players and the ringed ones. */
export function describeField(props: {
  play: LitePlay;
  against?: LitePlay;
  againstName?: string;
  ringSide?: 'offense' | 'defense';
  t: number;
  focus?: string[];
  spot?: BallSpot;
}): string {
  const { play, against, againstName, ringSide, t, focus = [] } = props;
  const spot = props.spot ?? play.spot;
  const ox = spotOffset(play.level, spot);
  const hot = against ? gapsAt(play, against, t, 1, ringSide) : [];
  const where = (id: string): string => {
    const track = play.tracks.find((candidate) => candidate.id === id);
    if (!track) return '';
    const p = pos(track, t);
    const rel = p.y >= 0 ? 'past' : 'behind';
    return `${id}, ${playerWord(track.id, track.role)}, is ${(p.x + ox).toFixed(0)} yards from the left sideline and ${Math.abs(p.y).toFixed(1)} yards ${rel} the line`;
  };
  const focusText = focus.map(where).filter(Boolean);
  return (
    `${play.name}, ${clockWords(t)}. Offense attacks up the page. Offense is filled amber marks and defense is hollow blue rings. The heavy line is the line of scrimmage. ` +
    `The ball is ${SPOT_WORDS[spot]}, with ${LEVEL_LABELS[play.level]} hash marks. ` +
    (focusText.length ? `${focusText.join('. ')}. ` : '') +
    (against
      ? hot.length
        ? `${hot.join(', ')} ${hot.length === 1 ? 'stands' : 'stand'} more than 1 yard from ${hot.length === 1 ? 'where that player is' : 'where they are'} in ${againstName ?? 'the other play'}, ringed in red.`
        : `No ${ringSide ? `${ringSide} player` : 'player'} is more than 1 yard from ${againstName ?? 'the other play'}.`
      : '')
  );
}

/**
 * What a reader needs to know about the moment before the snap: how long until the snap and who is moving. Offense and
 * defense are named apart because only an offensive player can be in motion; one is motion and two or more are a shift.
 */
export function describePresnap(play: LitePlay, t: number): string {
  const when = `${clockTenths(t)} s before the snap.`;
  if (!beforeSnap(t)) return when;
  const moving = movingAt(play, t);
  const side = (id: string) => play.tracks.find((track) => track.id === id)?.side;
  const offense = moving.filter((id) => side(id) === 'offense');
  const defense = moving.filter((id) => side(id) === 'defense');
  if (moving.length === 0) return `${when} Everyone is set.`;
  const parts: string[] = [];
  if (offense.length === 1) parts.push(`${offense[0]} is in motion`);
  else if (offense.length > 1) parts.push(`${list(offense)} are shifting`);
  if (defense.length > 0) parts.push(`${list(defense)} ${defense.length === 1 ? 'is' : 'are'} moving on defense`);
  return `${when} ${parts.join('. ')}.`;
}
