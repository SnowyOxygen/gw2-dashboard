import React from 'react'
import Card from './Card'

interface EventsCardProps {
  title: string
  hideHeader?: boolean
}

const EventsCard: React.FC<EventsCardProps> = ({ title, hideHeader = false }) => {
  return (
    <Card title={title} hideHeader={hideHeader}>
      {/* Your events card content goes here */}
      <div>Events content</div>
    </Card>
  )
}

export default EventsCard