import { supabase } from "../../auth/api/supabaseClient";
import { normalizeNickname } from "../nickname";

export const AVATAR_COLORS = ['mustard', 'blue', 'brick', 'green', 'teal', 'plum', 'coral', 'ink'] as const
export const THUMB_EXPRESSIONS = ['happy', 'laugh', 'in_love', 'calm', 'wink', 'kiss', 'excited', 'cool'] as const

export type AvatarColor = (typeof AVATAR_COLORS)[number]
export type ThumbExpression = (typeof THUMB_EXPRESSIONS)[number]

export type Avatar = {
    kind: 'thumb' | 'text'
    text: string
    expression: ThumbExpression
    thumbColor: AvatarColor
    color: AvatarColor  // Background of the tile.
    style: 'flat' | 'outline'
}

export type Profile = {
    id: string
    nickname: string
    avatar: Avatar
}

type ProfileRow = {
  id: string
  nickname: string
  tile_kind: Avatar['kind']
  tile_text: string
  thumb_expression: ThumbExpression
  thumb_color: AvatarColor
  tile_color: AvatarColor
  tile_style: Avatar['style']
}

const COLUMNS = 'id, nickname, tile_kind, tile_text, thumb_expression, thumb_color, tile_color, tile_style'

function toProfile(row: ProfileRow): Profile {
    return {
        id: row.id,
        nickname: row.nickname,
        avatar: {
            kind: row.tile_kind,
            text: row.tile_text,
            expression: row.thumb_expression,
            thumbColor: row.thumb_color,
            color: row.tile_color,
            style: row.tile_style,
        },
    }
}

export class NicknameTakenError extends Error {
    constructor() {
        super('Ese nickname ya está cogido.')
        this.name = 'NicknameTakenError'
    }
}

// Postgres error code for "duplicate key value violates unique constraint."
const UNIQUE_VIOLATION = '23505'

export async function getProfile(userId: string): Promise<Profile> {
    const {data, error} = await supabase.from('profiles').select(COLUMNS).eq('id', userId).single()
    if (error) throw error
    return toProfile(data as ProfileRow)
}

// Saves the nickname and the avatar and returns the saved profile. The unique index is the real check: if someone took the nickname after isNicknameAvailable said it was free,
//  this throws NicknameTakenError.
export async function updateProfile(userId: string, nickname: string, avatar: Avatar): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      nickname: normalizeNickname(nickname),
      tile_kind: avatar.kind,
      tile_text: avatar.text,
      thumb_expression: avatar.expression,
      thumb_color: avatar.thumbColor,
      tile_color: avatar.color,
      tile_style: avatar.style,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(COLUMNS)
    .single()
  if (error?.code === UNIQUE_VIOLATION) throw new NicknameTakenError()
  if (error) throw error
  return toProfile(data as ProfileRow)
}

// True if nobody else has this nickname, ignoring case. Your own nickname counts as available. Only a hint while typing: updateProfile decides.
export async function isNicknameAvailable(userId: string, nickname: string): Promise<boolean> {
  // In ilike, "_" means "any character": escape it so player_1 does not
  // match playerX1. "%" cannot appear, validateNickname does not allow it.
  const pattern = normalizeNickname(nickname).replaceAll('_', '\\_')
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('nickname', pattern)
    .neq('id', userId)
    .limit(1)
  if (error) throw error
  return data.length === 0
}