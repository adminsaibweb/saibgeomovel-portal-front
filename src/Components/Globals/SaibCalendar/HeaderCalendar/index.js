import React, { Component } from 'react';
import { Fragment } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import { Container, ContentNumDay } from './styled';

export default class HeaderCalendar extends Component {
  static contextType = SchedulesContext;
  render() {
    const { typeCalendar } = this.context;
    const { daysOfWeek } = this.props;
    return (
      <Container>
        {typeCalendar === '1' ? (
          <>
            {daysOfWeek.map((day, i) => (
              <Fragment key={i}>
                <div>
                  <p>{day.day}</p>
                  <ContentNumDay clicked={day.clicked && day.clicked}>
                    <p>{day.numDay}</p>
                  </ContentNumDay>
                </div>
              </Fragment>
            ))}
          </>
        ) : (
          <>
            <div>
              <p>Dom.</p>
            </div>
            <div>
              <p>Seg.</p>
            </div>
            <div>
              <p>Ter.</p>
            </div>
            <div>
              <p>Qua.</p>
            </div>
            <div>
              <p>Qui.</p>
            </div>
            <div>
              <p>Sex.</p>
            </div>
            <div>
              <p>Sab.</p>
            </div>
          </>
        )}
      </Container>
    );
  }
}
