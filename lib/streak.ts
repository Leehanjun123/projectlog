import { createClient } from '@/lib/supabase/client'

export async function updateStreak(userId: string) {
  const supabase = createClient()

  // Get current profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_update_date')
    .eq('id', userId)
    .single()

  if (!profile) return

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const lastUpdate = profile.last_update_date

  let newStreak = profile.current_streak || 0
  let newLongestStreak = profile.longest_streak || 0

  if (!lastUpdate) {
    // First update ever
    newStreak = 1
  } else if (lastUpdate === today) {
    // Already updated today, no change
    return
  } else {
    const lastDate = new Date(lastUpdate)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Consecutive day
      newStreak = (profile.current_streak || 0) + 1
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1
    }
  }

  // Update longest streak if needed
  if (newStreak > newLongestStreak) {
    newLongestStreak = newStreak
  }

  // Update profile
  await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_update_date: today
    })
    .eq('id', userId)

  return { current_streak: newStreak, longest_streak: newLongestStreak }
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '💯'
  if (streak >= 50) return '🌟'
  if (streak >= 30) return '⭐'
  if (streak >= 14) return '🔥🔥'
  if (streak >= 7) return '🔥'
  if (streak >= 3) return '✨'
  return '🌱'
}
