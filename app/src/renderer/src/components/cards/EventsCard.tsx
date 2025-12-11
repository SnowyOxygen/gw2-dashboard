import React from 'react'
import Card from './Card'

interface EventsCardProps {
  title: string
  // Add your specific props here
}

const EventsCard: React.FC<EventsCardProps> = ({ title }) => {
  return (
    <Card title={title}>
      {/* Your events card content goes here */}
      <div>Events content</div>
    </Card>
  )
}

export default EventsCard