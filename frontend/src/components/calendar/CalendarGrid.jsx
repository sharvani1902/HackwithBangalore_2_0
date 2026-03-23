import React from 'react';

export default function CalendarGrid({ currentDate, viewMode, meetings, onDateClick, onMeetingClick }) {

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const today = new Date();
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
        
        // Find meetings for this day
        const dayMeetings = meetings.filter(m => {
            const mDate = new Date(m.start_time);
            return mDate.getDate() === d && mDate.getMonth() === month && mDate.getFullYear() === year;
        }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        days.push(
            <div 
                key={`day-${d}`} 
                className={`calendar-cell ${isToday ? 'today' : ''}`}
                onClick={() => onDateClick(dateObj)}
            >
                <div className="date-number">{d}</div>
                <div className="meetings-container">
                    {dayMeetings.slice(0, 3).map(m => {
                        const mDate = new Date(m.start_time);
                        const timeStr = mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div 
                                key={m.id} 
                                className="meeting-badge"
                                onClick={(e) => { e.stopPropagation(); onMeetingClick(m); }}
                                title={m.title}
                            >
                                <span className="meeting-time">{timeStr}</span> {m.title}
                            </div>
                        );
                    })}
                    {dayMeetings.length > 3 && (
                        <div className="more-meetings">+{dayMeetings.length - 3} more</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-month-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-header-cell">{day}</div>
            ))}
            {days}
        </div>
    );
  };

  const renderWeekView = () => {
    // Basic week view prototype
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Sunday

    const days = [];
    for (let d = 0; d < 7; d++) {
        const dateObj = new Date(startOfWeek);
        dateObj.setDate(startOfWeek.getDate() + d);
        
        const dayMeetings = meetings.filter(m => {
            const mDate = new Date(m.start_time);
            return mDate.getDate() === dateObj.getDate() && mDate.getMonth() === dateObj.getMonth();
        });

        days.push(
            <div key={`week-day-${d}`} className="week-day-column" onClick={() => onDateClick(dateObj)}>
                <div className="week-day-header">
                    <span className="week-day-name">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="week-day-num">{dateObj.getDate()}</span>
                </div>
                <div className="week-day-content">
                    {dayMeetings.map(m => {
                        const mDate = new Date(m.start_time);
                        return (
                            <div 
                                key={m.id} 
                                className="meeting-card-vertical"
                                onClick={(e) => { e.stopPropagation(); onMeetingClick(m); }}
                                title={m.title}
                            >
                                <strong>{m.title}</strong>
                                <span>{mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-week-grid">
           {days}
        </div>
    );
  };

  return (
    <div className="calendar-system">
        {viewMode === "MONTH" ? renderMonthView() : renderWeekView()}
    </div>
  );
}
