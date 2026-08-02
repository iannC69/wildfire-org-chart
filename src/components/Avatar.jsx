import React from 'react'
import { getInitials } from '../data/staffData'

export default function Avatar({ name, color, glow, size = 48 }) {
  const initials = getInitials(name)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}30, #0d0d1a)`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 ${Math.round(size / 3)}px ${glow}, inset 0 0 ${Math.round(size / 4)}px ${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        fontWeight: 700,
        fontSize: Math.round(size * 0.32),
        letterSpacing: '0.5px',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {initials}
    </div>
  )
}
