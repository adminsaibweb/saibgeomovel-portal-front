import React, { Component } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import { Container, P } from './styled';

export default class CounterAgroupedPerStatus extends Component {
  static contextType = SchedulesContext;
  state = {
    loading: false,
    filterSchedules: '',
    data: [],
  };

  componentDidMount() {
    this.prepareData();
  }

  componentDidUpdate(prevProps) {
    const { filterSchedule } = this.context;
    const { filterSchedules } = this.state;

    if (prevProps.data !== this.props.data) {
      this.setState(
        {
          data: [],
        },
        () => this.prepareData()
      );
    }

    if (filterSchedule !== filterSchedules) {
      this.setState(
        {
          filterSchedules: filterSchedule,
        },
        () => this.prepareData()
      );
    }
  }

  prepareData = () => {
    const { data, day, month, week } = this.props;
    if (data) {
      if (month) {
        Object.keys(data).forEach((key) => {
          if (parseInt(key.substr(0, 2)) === day) {
            data[key].data.analytics = data[key].data.analytics.filter(
              (item) => item.label !== 'Tot. agendados' && item
            );

            this.setState(
              {
                allData: data[key].data,
                data: data[key].data,
              },
              () => this.filterData()
            );
          }
        });
      } else if (week) {
        let justificado = 0;
        let finalizados = 0;
        let atendendo = 0;
        let totAgendamentos = 0;
        let aguardando = 0;

        totAgendamentos += data.CLIENTES.length;
        data.CLIENTES.forEach((cliente) => {
          if (cliente.ATENDIDO) {
            finalizados += 1;
          }
          if (cliente.EM_ATENDIMENTO) {
            atendendo += 1;
          }
          if (cliente.JUSTIFICADO) {
            justificado += 1;
          }
        });

        aguardando = totAgendamentos - justificado - finalizados - atendendo;

        data.analytics = [
          { label: 'Finalizados', value: finalizados },
          { label: 'Atendendo', value: atendendo },
          { label: 'Justificados', value: justificado },
          { label: 'Aguardando', value: aguardando },
        ];
        this.setState(
          {
            allData: data,
            data: data,
          },
          () => this.filterData()
        );
      } else {
        let justificado = 0;
        let finalizados = 0;
        let atendendo = 0;
        let totAgendamentos = 0;
        let aguardando = 0;

        totAgendamentos += data.CLIENTES.length;
        data.CLIENTES.forEach((cliente) => {
          if (cliente.ATENDIDO) {
            finalizados += 1;
          }
          if (cliente.EM_ATENDIMENTO) {
            atendendo += 1;
          }
          if (cliente.JUSTIFICADO) {
            justificado += 1;
          }
        });

        aguardando = totAgendamentos - justificado - finalizados - atendendo;

        data.analytics = [
          { label: 'Finalizados', value: finalizados },
          { label: 'Atendendo', value: atendendo },
          { label: 'Justificados', value: justificado },
          { label: 'Aguardando', value: aguardando },
        ];
        this.setState(
          {
            allData: data,
            data: data,
          },
          () => this.filterData()
        );
      }
    }
  };

  filterData = () => {
    const { allData, filterSchedules } = this.state;

    if (filterSchedules) {
      let newData = {
        analytics: [],
      };
      for (let data_ of allData.analytics) {
        switch (filterSchedules) {
          case '1':
            data_.label === 'Aguardando' && newData.analytics.push(data_);
            break;

          case '2':
            data_.label === 'Atendendo' && newData.analytics.push(data_);
            break;
          case '3':
            data_.label === 'Finalizados' && newData.analytics.push(data_);
            break;
          case '4':
            newData.analytics.push(data_);
            break;

          default:
            break;
        }
      }
      this.setState({
        data: newData,
      });
    }
  };

  render() {
    const { data } = this.state;
    const { isHandleInLeftBar } = this.props;

    return (
      <Container clicked={this.props.clicked} flexDirection={isHandleInLeftBar ? 'row' : 'column'}>
        <ul>
          {data &&
            data.analytics &&
            data.analytics.map((item, i) => (
              <li key={i} onClick={() => {}}>
                <P
                  className="label"
                  color={
                    item.label === 'Finalizados'
                      ? 'rgb(39, 174, 96)'
                      : item.label === 'Atendendo'
                      ? 'rgb(142, 68, 173)'
                      : item.label === 'Justificados'
                      ? '#FA6D1E'
                      : '#000'
                  }
                >
                  {item.label}:
                </P>
                <P
                  color={
                    item.label === 'Finalizados'
                      ? 'rgb(39, 174, 96)'
                      : item.label === 'Atendendo'
                      ? 'rgb(142, 68, 173)'
                      : item.label === 'Justificados'
                      ? '#FA6D1E'
                      : '#000'
                  }
                >
                  {item.value}
                </P>
              </li>
            ))}
        </ul>
      </Container>
    );
  }
}
