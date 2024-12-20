import React, { Component } from 'react';
import { Icon, Table } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { Container, Linha, DivDetalhe, Th, Tr, Td, ContenTotal, LineTotal } from './styled';
import moment from 'moment';
export default class TradeInterruptions extends Component {
  static contextType = PanelMonitoringContext;
  state = {
    item: null,
    data: [],
    loading: true,
  };

  componentDidMount() {
    this.carregarVariaveisEstado();
    this.getDataProps();
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

  getDataProps = () => {
    let { item } = this.state;

    let gatId = this.props.location.state[0].GAT_ID;
    let gaaId = this.props.location.state[0].GAA_ID;
    const { statePrevius, urlPrevius, lineClicked, userName } = this.props.location.state[1];
    let forceBack = this.props.history.location.forceBack;
    item = this.props.location.state;
    this.setState(
      { item, loading: true, gaaId, gatId, forceBack, urlPrevius, statePrevius, lineClicked, userName },
      () => {
        this.getDataInterruption(gaaId);
        this.setLineClicked();
      }
    );
  };

  setLineClicked = async () => {
    const { setStatePanelMonitoring, statePanelMonitoring, setStateProfessionalData, stateProfessionalScheduleData } =
      this.context;
    let { lineClicked, userName } = this.state;

    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      lineClicked: lineClicked,
      filtering: false,
    });

    await setStateProfessionalData({
      ...stateProfessionalScheduleData,
      userName,
    });
  };

  prepareData = (data) => {
    let countAllHourStoped = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
    });

    data &&
      data.forEach((item) => {
        let interruptionStart = moment(item.INICIO.split(' ')[1], 'HH:mm:ss');
        let interruptionEnd = item.FIM && moment(item.FIM.split(' ')[1], 'HH:mm:ss');

        const end =
          item.FIM &&
          moment()
            .date(item?.FIM.split(' ')[0])
            .set({
              hour: interruptionEnd.get('hour'),
              minute: interruptionEnd.get('minute'),
              second: interruptionEnd.get('second'),
            });

        const dateHourSubtract = end
          ? end.subtract({
              hour: interruptionStart.get('hour'),
              minute: interruptionStart.get('minute'),
              second: interruptionStart.get('second'),
            })
          : //se nao teve fim pega a hora atual e subtrai pela a de inicio da pausa para otbter o tempo parado
            moment().subtract({
              hour: interruptionStart.get('hour'),
              minute: interruptionStart.get('minute'),
              second: interruptionStart.get('second'),
            });

        const dateHourSum = dateHourSubtract && {
          hour: dateHourSubtract.get('hour'),
          minute: dateHourSubtract.get('minute'),
          second: dateHourSubtract.get('second'),
        };

        countAllHourStoped.add(dateHourSum);

        const intervall = dateHourSubtract && new Date(dateHourSubtract).toLocaleTimeString();

        item.TIME_INTERVAL = intervall;
        data.ALL_TIME_INTERVALL = new Date(countAllHourStoped).toLocaleTimeString();
      });
  };

  getDataInterruption = async (id) => {
    const { usuarioAtivo, empresaAtiva } = this.state;

    const dataToSend = {
      gaaId: parseInt(id),
    };

    const url = `/v1/tradedashboard/interrupts/${empresaAtiva}/${usuarioAtivo}`;

    try {
      const res = await api.post(url, dataToSend);
      const { sucess, data } = res.data;
      if (sucess) {
        this.setState(
          {
            data,
          },
          () => this.prepareData(data)
        );
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { forceBack, data, loading } = this.state;
    const { stateProfessionalScheduleData } = this.context;

    return (
      <>
        <Header />

        <WaitScreen loading={loading} />

        <Container>
          <DirectTituloJanela
            classNameTitulo="professionalScheduleTitle"
            style={{ paddingLeft: '64px' }}
            // urlVoltar={this.props.history.location.urlPrevius}
            state={this.state.statePrevius ? this.state.statePrevius : this.props.location.statePrevius}
            stateUrl={this.state.urlPrevius ? this.state.urlPrevius : this.props.location.urlPrevius}
            forceBack={forceBack}
            titulo={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>do_not_disturb_off</Icon>Interrupções
              </span>
            }
          />

          <h5 className="title">{stateProfessionalScheduleData?.userName}</h5>

          <Linha>
            <DivDetalhe>
              <Table className="table-scroll small-first-col striped">
                <thead>
                  <tr>
                    <Th data-field="id">Seq.</Th>
                    <Th data-field="price" flex="2">
                      Descrição
                    </Th>
                    <Th data-field="name" withMinWidth>
                      Inicio
                    </Th>
                    <Th data-field="price" withMinWidth>
                      Fim
                    </Th>
                    <Th data-field="price">Tempo parado</Th>
                  </tr>
                </thead>

                <tbody className="body-half-screen">
                  {data.map((item, i) => (
                    <React.Fragment key={i}>
                      <Tr
                        onClick={() => {
                          this.setState({
                            clicked: true,
                            lineClicked: i,
                          });
                        }}
                      >
                        <Td>{item.ID}</Td>
                        <Td>{item.DESCRICAO}</Td>
                        <Td>{item.INICIO} </Td>
                        <Td>{item.FIM ? item.FIM : '##:##'} </Td>
                        <Td>{item.TIME_INTERVAL ? item.TIME_INTERVAL : '##:##'} </Td>
                      </Tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
              <LineTotal>
                <ContenTotal>
                  Quantidade paradas:
                  <p> &nbsp;{data.length} </p>
                </ContenTotal>{' '}
                |
                <ContenTotal>
                  Tempo total parado:
                  <p> &nbsp;{data.ALL_TIME_INTERVALL} </p>
                </ContenTotal>
              </LineTotal>
            </DivDetalhe>
          </Linha>
        </Container>
      </>
    );
  }
}
