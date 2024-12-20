import React, { Component } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import { capitalize } from '../../../../services/funcoes';
import CounterAgroupedPerStatus from '../CounterAgroupedPerStatus';
import { Container, Header } from './styled';
import moment from 'moment';

export default class CardEachItemOfWeek extends Component {
  static contextType = SchedulesContext;
  state = {
    data: [],
    itemClicked: false,
  };
  componentDidMount() {
    const { dateSelected } = this.context;
    this.handleData();
    this.setState(
      {
        dateSelected,
      },
      () => this.markItensCliked()
    );
  }

  componentDidUpdate(prevProps) {
    const { data, clean } = this.props;
    const { dateSelected } = this.context;

    if (data !== prevProps.data) {
      this.handleData();
      this.markItensCliked();
    }

    if (clean !== prevProps.clean) {
      this.setState(
        {
          itemClicked: false,
        }
        // () => this.markItensCliked()
      );
    }

    if (dateSelected !== this.state.dateSelected) {
      this.setState({
        dateSelected,
        // itemClicked: true,
      });
    }
  }

  markItensCliked = () => {
    const { data } = this.props;
    const { dateSelected } = this.context;

    const dayProps = moment(data.data[0].GAA_DTA_AGENDA, 'DD/MM/YYYY').date();
    const daySelected = moment(dateSelected).date();
    if (dayProps === daySelected) {
      this.setState({
        itemClicked: true,
      });
    } else {
      this.setState({
        itemClicked: false,
      });
    }
  };

  handleData = () => {
    const { data } = this.props;

    this.setState({
      allData: data.data,
      data: data.data,
    });
  };

  handleCard = async (data, index) => {
    const { cleanItemsClicked } = this.props;
    const { setDayOfMonthSelectedData, setOpenCard, setDateSelected } = this.context;
    await setOpenCard(true);
    await cleanItemsClicked();
    // moment.locale('pt-BR');
    // const _data = moment(data[0].GAA_DTA_AGENDA, 'DD/MM/YYYY')._d;
    this.setState({
      itemClicked: true,
    });

    data ? await setDayOfMonthSelectedData(data) : await setDayOfMonthSelectedData([]);
    await setDateSelected(moment(data[0].GAA_DTA_AGENDA, 'DD/MM/YYYY')._d);
  };

  render() {
    const { data } = this.state;
    return (
      <>
        {data.map((item, i) => (
          <Container key={i} onClick={() => this.handleCard(data, i)} clicked={this.state.itemClicked}>
            <Header>
              <p>{capitalize(item.USR_NOME, true)}</p>
            </Header>

            <div className="contentCounterAgruped">
              <CounterAgroupedPerStatus
                month={false}
                isHandleInLeftBar={false}
                week={true}
                data={item}
                clicked={i === this.state.itemClicked}
              />
            </div>
          </Container>
        ))}
      </>
    );
  }
}
