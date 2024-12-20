import React, { Component } from 'react';
import DaysInMonth from './DaysInMonth';
import HeaderCalendar from './HeaderCalendar';
import moment from 'moment';
import { TopBar, Container, DivDetalhe } from './styled';
import { Icon } from 'react-materialize';
import SchedulesContext from '../../../providers/schedules';
import WeekBar from '../../FieldWork/Schedules/WeekContainer';
import DayContainer from '../../FieldWork/Schedules/DayContainer';
export default class SaibCalendar extends Component {
  static contextType = SchedulesContext;

  state = {
    loading: true,
    positionDayInitalMonth: 0,
    quantityDaysOfMonth: 0,
    month: 0,
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    typeCalendar: '2',
    date: null,
    allDaysOfWeek: [],
  };

  componentDidMount() {
    const { dateSelected, typeCalendar } = this.context;
    const daySelected = moment(dateSelected).date();
    this.setState(
      {
        daySelected,
        year: moment(dateSelected).year(),
        month: moment(dateSelected).month(),
        typeCalendar,
      },
      () => this.handlePrepareCalendar()
    );
  }

  async componentDidUpdate() {
    const { dateSelected, typeCalendar } = this.context;
    const { month, year } = this.state;
    const daySelected = moment(dateSelected).date();

    if (daySelected !== this.state.daySelected) {
      this.setState(
        {
          daySelected,
        },
        async () => {
          await this.handlePrepareCalendar();
          this.handleDaysOfWeek();
        }
      );
    }

    if (daySelected !== this.state.daySelected && typeCalendar === '1') {
      this.setState({
        daySelected,
      });
      this.handleDaysOfWeek();
    }

    if (moment(dateSelected).year() !== year || moment(dateSelected).month() !== month) {
      this.setState(
        {
          year: moment(dateSelected).year(),
          month: moment(dateSelected).month(),
        },
        async () => {
          await this.handlePrepareCalendar();
          this.handleDaysOfWeek();
        }
      );
    }

    if (typeCalendar !== this.state.typeCalendar) {
      this.setState({
        typeCalendar,
      });

      if (typeCalendar === '1') {
        this.handleDaysOfWeek();
      }
    }
  }

  handleDaysOfWeek = () => {
    const { dateSelected } = this.context;
    const daysWeek = ['Dom.', 'Seg.', 'Terc.', 'Qua.', 'Qui.', 'Sex.', 'Sab.'];
    const dayOfWeek = moment(dateSelected).date();

    const positionDayOfWeek = moment(dateSelected).date(dayOfWeek).day();

    const lastDayOfMonth = moment(dateSelected).daysInMonth();

    const monthPrevius = moment(dateSelected)
      .month(moment(dateSelected).month() - 1)
      .month();
    const lastDayOfPreviusMonth = moment(dateSelected).month(monthPrevius).daysInMonth();

    const previousDays = [];
    const latestDays = [];

    let dayPrevius = dayOfWeek;
    let _auxCont = lastDayOfPreviusMonth;
    while (previousDays.length < positionDayOfWeek) {
      dayPrevius--;
      if (dayPrevius <= 0) {
        previousDays.push({ numDay: _auxCont, month: monthPrevius });
        _auxCont--;
      } else {
        previousDays.push({ numDay: dayPrevius, month: monthPrevius + 1 });
      }
    }

    let dayNext = dayOfWeek;
    let dayNextAux = 0;
    for (let i = previousDays.length; i < 7; i++) {
      if (dayNext > lastDayOfMonth) {
        dayNextAux++;
        latestDays.push({ numDay: dayNextAux, month: monthPrevius + 2 });
      } else {
        latestDays.push({ numDay: dayNext, month: monthPrevius + 1, clicked: dayNext === dayOfWeek });
        dayNext++;
      }
    }

    let previus = [];
    previus = previousDays.reverse();
    const allDaysOfWeek = previus.concat(latestDays);

    allDaysOfWeek.forEach((item, i) => {
      allDaysOfWeek[i].day = daysWeek[i];
    });

    this.setState({
      allDaysOfWeek,
    });
  };

  onChangeTypeCalendar = (ev) => {
    const { value } = ev.target;
    const { setTypeCalendar } = this.context;

    setTypeCalendar(value);
  };

  movimentMonth = (newMonth, movimentToRigth) => {
    let { year } = this.state;
    const { setDayOfMonthSelectedData, setDateSelected, typeCalendar } = this.context;

    setDayOfMonthSelectedData([]);

    if (newMonth > 11) {
      newMonth = 0;
      year += 1;
    } else if (newMonth < 0) {
      year -= 1;
      newMonth = 11;
    }

    if (typeCalendar === '2') {
      setDateSelected(moment().year(year).month(newMonth)._d);
    } else if (typeCalendar === '1') {
      this.movimentWeek(movimentToRigth);
    } else {
      this.movimentDay(movimentToRigth);
    }
  };

  movimentWeek = (movimentToRigth) => {
    const { dateSelected, setDateSelected } = this.context;
    const daysInMonth = moment(dateSelected).daysInMonth();
    let day = moment(dateSelected).date();
    let month = moment(dateSelected).month();
    let year = moment(dateSelected).year();

    if (movimentToRigth) {
      day += 7;
      if (day > daysInMonth) {
        if (month === 11) {
          month = 0;
          year++;
        } else {
          month++;
        }
      }

      setDateSelected(moment(moment(dateSelected).date(day).month(month).year(year))._d);
    } else {
      day -= 7;
      if (day <= 0) {
        if (month === 0) {
          month = 11;
          year--;
        } else {
          month--;
        }
      }
      setDateSelected(moment(moment(dateSelected).date(day).month(month).year(year))._d);
    }
  };

  movimentDay = (movimentToRigth) => {
    const { dateSelected, setDateSelected } = this.context;
    const daysInMonth = moment(dateSelected).daysInMonth();
    let day = moment(dateSelected).date();
    let month = moment(dateSelected).month();
    let year = moment(dateSelected).year();

    if (movimentToRigth) {
      day += 1;
      if (day > daysInMonth) {
        if (month === 11) {
          month = 0;
          year++;
        } else {
          month++;
        }
      }

      setDateSelected(moment(moment(dateSelected).date(day).month(month).year(year))._d);
    } else {
      day -= 1;
      if (day <= 0) {
        if (month === 0) {
          month = 11;
          year--;
        } else {
          month--;
        }
      }
      setDateSelected(moment(moment(dateSelected).date(day).month(month).year(year))._d);
    }
  };

  handlePrepareCalendar = async () => {
    const { month, year } = this.state;
    const { dateSelected } = this.context;
    const day = moment(dateSelected).date();
    const { handleChangePeriod } = this.props;

    const daysOfMonth = moment(dateSelected).month(month).year(year).daysInMonth();

    const initialDayOfWeek = moment(dateSelected).month(month).year(year).startOf('month').format('dddd');

    let positionDayInitialInArrayWeek;

    switch (initialDayOfWeek) {
      case 'Sunday':
        positionDayInitialInArrayWeek = 0;
        break;
      case 'Monday':
        positionDayInitialInArrayWeek = 1;
        break;
      case 'Tuesday':
        positionDayInitialInArrayWeek = 2;
        break;
      case 'Wednesday':
        positionDayInitialInArrayWeek = 3;
        break;
      case 'Thursday':
        positionDayInitialInArrayWeek = 4;
        break;
      case 'Friday':
        positionDayInitialInArrayWeek = 5;
        break;
      case 'Saturday':
        positionDayInitialInArrayWeek = 6;
        break;

      default:
        return '';
    }

    this.setState(
      {
        positionDayInitalMonth: positionDayInitialInArrayWeek,
        quantityDaysOfMonth: daysOfMonth,
        monthSelected: month,
        loading: false,
      },
      () => {
        handleChangePeriod(year, month, day);
      }
    );
  };

  render() {
    const {
      positionDayInitalMonth,
      quantityDaysOfMonth,
      month,
      loading,
      monthSelected,
      months,
      year,
      typeCalendar,
      allDaysOfWeek,
    } = this.state;
    const { dateSelected } = this.context;
    const { finalizado, executado, agendado, data } = this.props;

    const firstDay = allDaysOfWeek[0]?.numDay;
    const lastDay = allDaysOfWeek[allDaysOfWeek.length - 1]?.numDay;

    return (
      <Container>
        <TopBar>
          <DivDetalhe>
            <div className="contentIcons">
              <div className="prev" onClick={() => this.movimentMonth(month - 1, false)}>
                <Icon>navigate_before</Icon>
              </div>
              <div className="next" onClick={() => this.movimentMonth(month + 1, true)}>
                <Icon>keyboard_arrow_right</Icon>
              </div>
            </div>

            <div className="date">
              {typeCalendar === '0' ? (
                <>
                  <p>{moment(dateSelected).date()} de </p>
                  <p>{months[month]} de </p>
                  <p>{year}</p>
                </>
              ) : typeCalendar === '1' ? (
                <>
                  <p>Dia {firstDay}</p>
                  <p>{months[month]}</p>
                  <p>até {lastDay}</p>
                  <p>de {months[month]}</p>
                </>
              ) : (
                <>
                  <p>{months[month]}</p>
                  <p>{year}</p>
                </>
              )}
            </div>
          </DivDetalhe>

          <DivDetalhe>
            <select
              onChange={this.onChangeTypeCalendar}
              style={{ marginTop: '5px' }}
              multiple={false}
              value={typeCalendar}
            >
              <option value="0">Dia</option>
              <option value="1">Semana</option>
              <option value="2">Mes</option>
            </select>
          </DivDetalhe>
        </TopBar>
        {typeCalendar !== '0' && <HeaderCalendar daysOfWeek={allDaysOfWeek} />}

        {typeCalendar === '1' && <WeekBar data={data} daysOfWeek={allDaysOfWeek} />}

        {typeCalendar === '0' && (
          <DayContainer
            data={data}
            finalizado={finalizado}
            executado={executado}
            agendado={agendado}
            daysOfWeek={allDaysOfWeek}
          />
        )}

        {!loading && typeCalendar === '2' && (
          <DaysInMonth
            data={data}
            year={year}
            positionDayInitalMonth={positionDayInitalMonth}
            quantityDaysOfMonth={quantityDaysOfMonth}
            month={monthSelected}
          />
        )}
      </Container>
    );
  }
}
