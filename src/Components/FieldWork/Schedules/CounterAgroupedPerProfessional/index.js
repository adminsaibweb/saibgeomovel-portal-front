import React, { Component, Fragment } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import { capitalize } from '../../../../services/funcoes';
import { Container, LabelStatus, LabelClient } from './styled';

export default class CounterAgroupedPerProfessional extends Component {
  static contextType = SchedulesContext;
  state = {
    loading: true,
    filterSchedules: '',
    data: [],
  };

  componentDidMount() {
    this.setState(
      {
        data: [this.props.data],
      },
      () => this.prepareData()
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState(
        {
          data: [this.props.data],
        },
        () => this.prepareData()
      );
    }
  }

  prepareData = () => {
    const { data } = this.state;
    if (data.length > 0) {
      const inExecution = {
        label: 'Em atendimento',
        value: data[0].CLIENTES.filter((client) => client.EM_ATENDIMENTO),
      };
      const inWaiting = {
        label: 'Aguardando',
        value: data[0].CLIENTES.filter((client) => !client.EM_ATENDIMENTO && !client.ATENDIDO && !client.JUSTIFICADO),
      };
      const finalized = {
        label: 'Finalizados',
        value: data[0].CLIENTES.filter((client) => client.ATENDIDO),
      };
      const justified = {
        label: 'Justificados',
        value: data[0].CLIENTES.filter((client) => client.JUSTIFICADO),
      };
      let data_ = [inExecution, inWaiting, finalized, justified];
      this.setState(
        {
          allData: data_,
          data: data_,
          loading: false,
        }

        // () => this.filterData()
      );
    }
  };

  filterData = () => {
    const { allData, filterSchedules } = this.state;
    if (filterSchedules) {
      let newData = {
        analytics: [],
      };
      for (let data_ of allData) {
        switch (filterSchedules) {
          case '1':
            data_.label === 'Aguardando' && newData.analytics.push(data_);
            break;

          case '2':
            data_.label === 'Em atendimento' && newData.analytics.push(data_);
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
    const { data, loading } = this.state;

    return (
      <Container>
        {!loading && (
          <div>
            {data.length > 0 &&
              data.map((item, i) => (
                <Fragment key={i}>
                  {item?.value?.length > 0 && (
                    <>
                      <LabelStatus
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
                        {item.label}
                      </LabelStatus>
                      <div className="contentClients">
                        {item.value.map((client, j) => {
                          if (j === item.value.length - 1) {
                            return <LabelClient key={j}> {capitalize(client.CLI_NOME_FANTASIA, true)} </LabelClient>;
                          } else
                            return (
                              <LabelClient key={j}>
                                {capitalize(client.CLI_NOME_FANTASIA, true)} <label>|</label>
                              </LabelClient>
                            );
                        })}
                      </div>
                    </>
                  )}
                </Fragment>
              ))}
          </div>
        )}
      </Container>
    );
  }
}
