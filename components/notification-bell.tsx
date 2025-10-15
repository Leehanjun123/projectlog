'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, count } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(display_name),
        update:updates(id, content)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(5)

    setNotifications(data || [])
    setUnreadCount(count || 0)
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    loadNotifications()
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    loadNotifications()
  }

  const getNotificationText = (notif: any) => {
    const actorName = notif.actor?.display_name || 'Someone'
    switch (notif.type) {
      case 'like':
        return `${actorName} liked your update`
      case 'comment':
        return `${actorName} commented on your update`
      case 'follow':
        return `${actorName} started following you`
      default:
        return 'New notification'
    }
  }

  const getNotificationLink = (notif: any) => {
    if (notif.type === 'follow') {
      return `/profile/${notif.actor_id}`
    }
    return notif.update_id ? `/projects/${notif.update?.id}` : '/feed'
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-20 max-h-[500px] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={getNotificationLink(notif)}
                    onClick={() => {
                      markAsRead(notif.id)
                      setShowDropdown(false)
                    }}
                  >
                    <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-900">
                        {getNotificationText(notif)}
                      </p>
                      {notif.update?.content && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notif.update.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No new notifications</p>
              </div>
            )}

            <div className="p-3 border-t bg-gray-50">
              <Link href="/notifications" onClick={() => setShowDropdown(false)}>
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all notifications
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
