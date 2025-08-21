import React from 'react'
import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'currentColor',
  text,
  className = ''
}) => {
  return (
    <div className={`loading-container ${className}`}>
      <div 
        className={`loading-spinner loading-spinner-${size}`}
        style={{ borderTopColor: color }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
