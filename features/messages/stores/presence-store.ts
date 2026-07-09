"use client";

import { create } from "zustand";
import { getPusherClient } from "@/lib/pusher/pusher-client";

type PresenceState = {
  onlineUserIds: Set<string>;
  _subscriptions: Record<string, true>;
  subscribeToUser: (userId: string) => void;
  unsubscribeFromUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;
  clear: () => void;
};

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),
  _subscriptions: {},

  subscribeToUser: (userId: string) => {
    const { _subscriptions } = get();
    if (_subscriptions[userId]) return;

    const channelName = `presence-online-${userId}`;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(channelName);

    channel.bind(
      "pusher:subscription_succeeded",
      (members: { members: Record<string, unknown> }) => {
        const memberIds = Object.keys(members.members);
        set((s) => {
          const next = new Set(s.onlineUserIds);
          for (const id of memberIds) {
            if (id !== userId) next.add(id);
          }
          return { onlineUserIds: next };
        });
      },
    );

    channel.bind("pusher:member_added", (member: { id: string }) => {
      if (member.id === userId) return;
      set((s) => {
        const next = new Set(s.onlineUserIds);
        next.add(member.id);
        return { onlineUserIds: next };
      });
    });

    channel.bind("pusher:member_removed", (member: { id: string }) => {
      if (member.id === userId) return;
      set((s) => {
        const next = new Set(s.onlineUserIds);
        next.delete(member.id);
        return { onlineUserIds: next };
      });
    });

    set((s) => ({
      _subscriptions: { ...s._subscriptions, [userId]: true as const },
    }));
  },

  unsubscribeFromUser: (userId: string) => {
    const { _subscriptions } = get();
    if (!_subscriptions[userId]) return;

    const channelName = `presence-online-${userId}`;
    const pusher = getPusherClient();
    if (!pusher) return;
    pusher.unsubscribe(channelName);

    const newSubs = { ..._subscriptions };
    delete newSubs[userId];
    set({ _subscriptions: newSubs });
  },

  isOnline: (userId: string) => {
    return get().onlineUserIds.has(userId);
  },

  clear: () => {
    const { _subscriptions } = get();
    const pusher = getPusherClient();
    if (!pusher) return;
    for (const userId of Object.keys(_subscriptions)) {
      pusher.unsubscribe(`presence-online-${userId}`);
    }
    set({ onlineUserIds: new Set(), _subscriptions: {} });
  },
}));
