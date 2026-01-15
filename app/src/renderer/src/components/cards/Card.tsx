import React from 'react'
import './Card.css'

interface CardProps {
  title: string
  children?: React.ReactNode
  hideHeader?: boolean
}

const Card: React.FC<CardProps> = ({ title, children, hideHeader = false }) => {
  return (
    <div className="card">
      {!hideHeader && <h2 className="card-title">{title}</h2>}
      <div className="card-content">{children}</div>
    </div>
  )
}

export default Card
