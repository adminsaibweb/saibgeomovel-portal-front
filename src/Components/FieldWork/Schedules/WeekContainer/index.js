import React, { Component } from 'react';
import CardEachItemOfWeek from '../CardEachItemOfWeek';
import { Container, ColumnDay } from './styled';
import moment from 'moment';
import SchedulesContext from '../../../../providers/schedules';
export default class WeekContainer extends Component {
  static contextType = SchedulesContext;
  state = {
    clean: false,
    data: [],
  };

  async componentDidMount() {
    this.handlePrepareData();

    await this.handleCards();
  }

  async componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (prevProps.data !== data) {
      this.handlePrepareData();
    }
  }

  handlePrepareData() {
    const { data } = this.props;
    this.handleCards();
    data &&
      this.setState({
        data,
      });
  }

  cleanItemsClicked = async () => {
    const { clean } = this.state;
    this.setState({
      clean: clean ? false : true,
    });
  };

  handleCards = async () => {
    const { setDayOfMonthSelectedData, dateSelected, setOpenCard } = this.context;
    const { data } = this.props;
    const day = moment(dateSelected).date();

    let res;
    data &&
      Object.keys(data).forEach((key) => {
        if (parseInt(data[key].day) === parseInt(day)) {
          res = data[key].data;
        }
      });

    setOpenCard(true);
    res ? await setDayOfMonthSelectedData(res) : await setDayOfMonthSelectedData([]);
  };

  render() {
    const { data, clean } = this.state;
    const { daysOfWeek } = this.props;

    return (
      <Container>
        {daysOfWeek.map((item, i) => (
          <ColumnDay key={i}>
            {Object.keys(data).map(
              (key, j) =>
                data[key].day === parseInt(item.numDay) &&
                data[key].month === parseInt(item.month) && (
                  <CardEachItemOfWeek
                    data={data[key]}
                    key={item.numDay}
                    cleanItemsClicked={this.cleanItemsClicked}
                    clean={clean}
                  />
                )
            )}
          </ColumnDay>
        ))}
      </Container>
    );
  }
}
