import { ptBR } from 'date-fns/locale';
import React, { Component, forwardRef } from 'react';
import { Collapsible, CollapsibleItem } from 'react-materialize';
import DatePicker from 'react-datepicker';
import { alerta, capitalize, dateFormat } from '../../../../services/funcoes';
import { Container, ContentDate, ContentCards } from './styled';
import CardAgroupedPerCount from '../CardAgroupedPerCount';
import SchedulesContext from '../../../../providers/schedules';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div
    className="testestsetstsetststsetstest"
    style={{
      cursor: 'pointer',
      marginLeft: '10px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }}
    onClick={onClick}
  >
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
        width: 'max-content',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

export default class LeftBar extends Component {
  static contextType = SchedulesContext;
  state = {
    dateSelected: new Date(),
    data: [],
    allUsers: [],
  };

  async componentDidMount() {
    const { dayOfMonthSelectedData } = this.context;
    await this.carregarVariaveisEstado();
    await this.listAllUsers();

    this.handlePrepareData(dayOfMonthSelectedData);
    this.setState({
      data: dayOfMonthSelectedData,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { data } = this.state;
    const { dayOfMonthSelectedData } = this.context;
    if (data !== dayOfMonthSelectedData) {
      this.handlePrepareData(dayOfMonthSelectedData);
      this.setState({
        data: dayOfMonthSelectedData,
      });
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  listAllUsers = async () => {
    try {
      const res = await api.get(`v1/users/${this.state.empresaAtiva}`);
      const { data, sucess } = res.data;

      if (sucess) {
        this.setState({
          allUsers: data,
        });
      } else {
        alerta('Erro ao carregar usuários');
      }
    } catch (error) {}
  };

  returnProfessionUser = (user) => {
    if (user.USR_GMOVEL_TRADE === 'V') {
      if (user.USR_GMOVEL_PROMOTOR === 'V') {
        return 'Promotor';
      } else if (user.USR_GMOVEL_SUPERVISOR === 'V') {
        return 'Supervisor';
      } else {
        return 'Gerente';
      }
    } else {
      return '-- ';
    }
  };

  handleProfessionUserSchedule = (idUser, schedule) => {
    const { allUsers } = this.state;
    for (let user of allUsers) {
      if (user.USR_ID === parseInt(idUser)) {
        schedule.profession = this.returnProfessionUser(user);
      }
    }
  };

  handlePrepareData = (data) => {
    data &&
      data.forEach((schedule) => {
        this.handleProfessionUserSchedule(schedule.GAA_USR_ID_AGENDA, schedule);
      });
  };

  onChangeCalendar = async (date) => {
    const { onChangeCalendar } = this.props;
    const { setDateSelected } = this.context;

    await setDateSelected(date);

    this.setState(
      {
        dateSelected: date,
      },
      () => onChangeCalendar(date)
    );
  };

  render() {
    const { data } = this.state;
    const {
      dateSelected,
      typeCalendar,
      openCard,
      setExpandedCollapsibleCalendarLeftBar,
      collpasibleCalendarLeftBarExpanded,
    } = this.context;
    return (
      <Container disableMinWidth={typeCalendar === '1' || typeCalendar === '0'} typeCalendar={typeCalendar}>
        <Collapsible
          accordion
          options={{
            onOpenEnd: async () => await setExpandedCollapsibleCalendarLeftBar(),
            onCloseEnd: async () => await setExpandedCollapsibleCalendarLeftBar(),
          }}
        >
          <CollapsibleItem
            expanded={collpasibleCalendarLeftBarExpanded || typeCalendar === '1' || typeCalendar === '0'}
            header={dateFormat(dateSelected, 'DD/MM/yyyy')}
            node="div"
          >
            <ContentDate>
              <div className="contentDate">
                <DatePicker
                  inline
                  selected={dateSelected}
                  onChange={async (date) => {
                    await this.onChangeCalendar(date);
                  }}
                  locale={ptBR}
                  placeholderText="Data inicial"
                  dateFormat="dd/MM/yyyy"
                  selectsStart
                  todayButton="Hoje"
                  customInput={<CustomCalendarInput />}
                />
              </div>
            </ContentDate>
          </CollapsibleItem>
        </Collapsible>

        <div className="contentCenter">
          {typeCalendar === '1' ? (
            openCard ? (
              <ContentCards>
                {data.map((item, j) => (
                  <CardAgroupedPerCount
                    key={j}
                    profession={item.profession}
                    name={capitalize(item.USR_NOME, true)}
                    counterAttendance={item.QTDE_CLIENTES}
                    status={item}
                  />
                ))}
              </ContentCards>
            ) : (
              ''
            )
          ) : (
            typeCalendar === '2' && (
              <ContentCards>
                {data.map((item, i) => (
                  <CardAgroupedPerCount
                    key={i}
                    profession={item.profession}
                    name={capitalize(item.USR_NOME, true)}
                    counterAttendance={item.QTDE_CLIENTES}
                    status={item}
                  />
                ))}
              </ContentCards>
            )
          )}
        </div>
      </Container>
    );
  }
}
