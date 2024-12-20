import React, { Component } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import CounterAgroupedPerStatus from '../../../FieldWork/Schedules/CounterAgroupedPerStatus';
import WaitScreen from '../../WaitScreen';
import { Container, Day, RowDays } from './styled';
import moment from 'moment';
export default class DaysInMonth extends Component {
  static contextType = SchedulesContext;
  state = {
    itemClicked: null,
    loading: true,
  };

  async componentDidMount() {
    this.setState({
      loading: true,
    });

    this.handePrepareData();
  }

  async componentDidUpdate(prevProps, prevState) {
    const { setDateSelected, dateSelected } = this.context;
    const { month, year } = this.props;
    const { itemClicked } = this.state;

    if (prevProps.data !== this.props.data) {
      await this.handleCards(moment(dateSelected).date());
    }

    if (prevProps.month !== this.props.month) {
      this.setState({
        loading: true,
        itemClicked: moment(dateSelected).date(),
      });
      await setDateSelected(moment().date(moment(dateSelected).date()).year(year).month(month)._d);
      this.handePrepareData();
    }
    if (moment(dateSelected).date() !== itemClicked) {
      this.setState({
        itemClicked: moment(dateSelected).date(),
      });
    }
  }

  handePrepareData = () => {
    const { positionDayInitalMonth, quantityDaysOfMonth } = this.props;

    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push([
        { position: 0, value: '', index: i },
        { position: 1, value: '' },
        { position: 2, value: '' },
        { position: 3, value: '' },
        { position: 4, value: '' },
        { position: 5, value: '' },
        { position: 6, value: '' },
      ]);
    }

    for (let j = 0; j < 7; j++) {
      if (weeks[0][j].position === positionDayInitalMonth) {
        weeks[0][j].value = 1;
      }
    }

    let dia = 1;

    weeks.forEach((week, j) => {
      week.forEach((day, index) => {
        if (j === 0 && index <= positionDayInitalMonth) {
        } else {
          dia += 1;
          if (dia <= quantityDaysOfMonth) {
            day.value = dia;
          }
        }
      });
    });

    this.setState(
      {
        weeks,
      }
      // () => this.prepareData()
    );

    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 500);
  };

  handleCards = async (day) => {
    if (day) {
      const { data } = this.props;
      const { setDayOfMonthSelectedData } = this.context;

      let res;

      Object.keys(data).forEach((key) => {
        if (parseInt(data[key].day) === parseInt(day)) {
          res = data[key].data;
        }
      });

      //this problem on here
      res ? await setDayOfMonthSelectedData(res) : await setDayOfMonthSelectedData([]);
    }
  };

  render() {
    const { weeks } = this.state;
    const { data, month, year } = this.props;
    const { setDateSelected } = this.context;
    return (
      <Container>
        <WaitScreen loading={this.state.loading} />
        {weeks &&
          weeks.map((week, i) => (
            <RowDays key={i}>
              {week.map((day, j) => (
                <Day
                  clicked={day.value === this.state.itemClicked}
                  key={day.position}
                  onClick={async () => {
                    this.setState(
                      {
                        itemClicked: day.value,
                      },
                      async () => {
                        await setDateSelected(moment().date(day.value).month(month).year(year)._d);
                        await this.handleCards(day.value);
                      }
                    );
                  }}
                >
                  {day.value}
                  <CounterAgroupedPerStatus data={data} day={day.value} month={true} />
                </Day>
              ))}
            </RowDays>
          ))}
      </Container>
    );
  }
}
