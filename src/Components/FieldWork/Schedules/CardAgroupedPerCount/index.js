import React, { Component } from 'react';
import { Icon } from 'react-materialize';
import { Link } from 'react-router-dom';
import SchedulesContext from '../../../../providers/schedules';
import CounterAgroupedPerProfessional from '../CounterAgroupedPerProfessional';
import CounterAgroupedPerStatus from '../CounterAgroupedPerStatus';
import { Container, Professional, ContentHeader, Attendance, FooterCard } from './styled';

export default class CardAgroupedPerCount extends Component {
  static contextType = SchedulesContext;

  render() {
    const { profession, name, status, counterAttendance } = this.props;
    const { typeCalendar, dateSelected } = this.context;
    return (
      <Container>
        <ContentHeader>
          <Professional>
            {profession}: {name}
          </Professional>

          <Attendance>Tot. atendimentos: {counterAttendance}</Attendance>
        </ContentHeader>

        {typeCalendar === '1' ? (
          <CounterAgroupedPerProfessional data={status} month={false} />
        ) : (
          <CounterAgroupedPerStatus isHandleInLeftBar data={status} month={false} />
        )}

        <FooterCard justifyContent={status.GAA_FLG_STATUS === 1 ? 'space-between' : 'center'}>
          {status.GAA_FLG_STATUS === 1 && (
            <Link
              to={{
                pathname: '/Schedule',
                state: { schedules: status, action: 'editar', typeCalendar, dateSelected },
              }}
            >
              <Icon>edit</Icon>Editar
            </Link>
          )}

          <Link
            to={{
              pathname: '/Schedule',
              state: { schedules: status, action: 'view', typeCalendar, dateSelected },
            }}
          >
            <Icon>pageview</Icon>Visualizar
          </Link>
        </FooterCard>
      </Container>
    );
  }
}
