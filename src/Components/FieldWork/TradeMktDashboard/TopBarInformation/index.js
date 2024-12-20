import React, { Component } from 'react';

import AlertsIndicator from './AlertsIndicator';
import TradeDetailsIndicator from './TradeDetailsIndicator';
import TradeDetailsIndicatorMobile from './TradeDetailsIndicatorMobile';
import ClientsIndicator from './ClientsIndicator';
import ClientsIndicatorMobile from './ClientsIndicatorMobile';
import Calendar from '../../../Globals/Calendar';

import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import { Container, DivDetalhe, Labels, Linha, ContentBodyCollapsible, LabelUpdate, DivFinal } from './styled';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import { Link } from 'react-router-dom';
import Question from '../../../Globals/Question';
import FindSchedule from '../FindSchedule';
import AlertsIndicatorMobile from './AlertsIndicatorMobile';

export default class TopBarInformation extends Component {
  static contextType = PanelMonitoringContext;
  state = {
    forceLoading: false,
    loading: true,
    typeFilter: '1',
    dataSchedules: [],
    findDate: new Date(),
    lineClicked: undefined,
  };

  async componentDidMount() {
    const { statePanelMonitoring } = this.context;
    this.setState({
      typeFilter: statePanelMonitoring.typeFilter,
      lineClicked: statePanelMonitoring.lineClicked,
    });
    await this.handleDatas();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data || prevProps.clientsData !== this.props.clientsData) {
      await this.handleDatas();
    }

    if (prevProps.loading !== this.props.loading) {
      this.setState({
        loading: this.props.loading,
      });
    }
  }

  handleDifferenceData = (prevProps) => {
    const thisData = this.props.data.sort((a, b) => {
      return a.GAA_ID - b.GAA_ID;
    });
    const oldData = prevProps.data.sort((a, b) => {
      return a.GAA_ID - b.GAA_ID;
    });

    for (let [i, data] of oldData.entries()) {
      const combinedObject = { ...data, ...thisData[i] };
      Object.entries(combinedObject).reduce((acc, [key, value]) => {
        if (!Object.values(data).includes(value) || !Object.values(thisData[i]).includes(value)) acc[key] = value;
        return acc;
      }, {});
    }
  };

  handleDatas = async () => {
    const { data, clientsData } = this.props;

    if (data) {
      this.setState({
        dataSchedules: data,
      });
    }
    if (clientsData) {
      this.setState({
        clientsData: clientsData,
      });
    }
  };

  handleButtonUpdate = () => {
    this.setState({
      forceLoading: true,
    });
    this.props.updateData(true);
  };

  render() {
    const { alerts, handleDataPerFilter, onChangeDate, date, empresaAtiva, usuarioAtivo, isMobile } = this.props;

    const { dataSchedules, clientsData, typeFilter, forceLoading, loading, findDate, lineClicked } = this.state;

    return (
      <Container isMobile={isMobile}>
        {!loading && (
          <>
            {isMobile ? (
              <>
                <DivDetalhe flex="1" padding="10px 10px 0 10px" width="100%">
                  <Calendar
                    date={date}
                    onChange={(date) => {
                      this.setState({
                        forceLoading: true,
                        findDate: date,
                      });
                      onChangeDate(date).then(() => {
                        this.setState({
                          forceLoading: false,
                        });
                      });
                    }}
                  />
                </DivDetalhe>

                <Linha>
                  <DivDetalhe width="100%">
                    <select
                      className="selectTypeEmployee"
                      value={typeFilter}
                      onChange={(ev) => {
                        this.setState({ typeFilter: ev.target.value });
                        handleDataPerFilter(ev);
                      }}
                      multiple={false}
                      options={{
                        classes: '',
                        dropdownOptions: {
                          alignment: 'left',
                          autoTrigger: true,
                          closeOnClick: true,
                          constrainWidth: true,
                          coverTrigger: true,
                          hover: false,
                          inDuration: 150,
                          onCloseEnd: null,
                          onCloseStart: null,
                          onOpenEnd: null,
                          onOpenStart: null,
                          outDuration: 250,
                        },
                      }}
                    >
                      <option value="0">Supervisor</option>
                      <option value="1">Promotor</option>
                    </select>
                  </DivDetalhe>

                  <DivDetalhe>
                    <button className="saib-button is-primary update" onClick={this.handleButtonUpdate}>
                      <Icon>update</Icon>
                    </button>
                  </DivDetalhe>
                </Linha>

                <Collapsible
                  accordion
                  style={{
                    width: '100%',
                    borderStyle: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <CollapsibleItem expanded={false} header="Totalizador" node="div">
                    <ContentBodyCollapsible>
                      <DivDetalhe width="100%" padding="10px 5px">
                        <AlertsIndicatorMobile alerts={alerts} typeFilter={typeFilter} forceLoading={forceLoading} />
                      </DivDetalhe>

                      <DivDetalhe padding="10px 5px">
                        <TradeDetailsIndicatorMobile data={dataSchedules} forceLoading={forceLoading} />
                      </DivDetalhe>
                      <DivDetalhe padding="10px 5px">
                        <ClientsIndicatorMobile
                          isMobile={isMobile}
                          data={clientsData}
                          dataSchedules={dataSchedules}
                          typeFilter={typeFilter}
                          forceLoading={forceLoading}
                        />
                      </DivDetalhe>
                    </ContentBodyCollapsible>
                  </CollapsibleItem>
                </Collapsible>

                <Linha>
                  <DivDetalhe width="100%" padding="10px 5px">
                    <Link
                      to={{
                        pathname: '/TradePosition',
                        state: [{ lineClicked }],
                        usuarioAtivo,
                        empresaAtiva,
                      }}
                      className="saib-button is-primary"
                    >
                      <Icon style={{ padding: '14px' }}>map</Icon>
                      <Labels style={{ color: 'white', cursor: 'pointer' }} fontSize="0.9rem">
                        Posição atual
                      </Labels>
                    </Link>
                  </DivDetalhe>
                  <DivDetalhe padding="10px 5px" isMobile={isMobile} width="100%">
                    <Question
                      iconeBotaoPadrao={<Icon tiny>search</Icon>}
                      classeBotaoPadrao="saib-button is-circle searchButton"
                      textoBotaoPadrao="Loc. agenda"
                      titulo="Localizar agendamento"
                      tituloBotaoSim="Fechar"
                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      tituloBotaoNao=""
                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close hidden"
                      message={<FindSchedule isMobile={isMobile} searchDate={findDate} />}
                      onNo={() => {}}
                      onYes={() => {}}
                    />
                  </DivDetalhe>
                </Linha>
              </>
            ) : (
              <>
                <DivDetalhe style={{ flexGrow: 1 }}>
                  <button
                    className="saib-button is-primary update"
                    onClick={this.handleButtonUpdate}
                    style={{ width: '100%' }}
                  >
                    <Icon>update</Icon>
                    <LabelUpdate>Atualizar</LabelUpdate>
                  </button>
                </DivDetalhe>

                <DivDetalhe style={{ flexGrow: 1 }}>
                  <select
                    className="selectTypeEmployee"
                    style={{ width: '100%' }}
                    value={typeFilter}
                    onChange={(ev) => {
                      this.setState({ typeFilter: ev.target.value });
                      handleDataPerFilter(ev);
                    }}
                    multiple={false}
                    options={{
                      classes: '',
                      dropdownOptions: {
                        alignment: 'left',
                        autoTrigger: true,
                        closeOnClick: true,
                        constrainWidth: true,
                        coverTrigger: true,
                        hover: false,
                        inDuration: 150,
                        onCloseEnd: null,
                        onCloseStart: null,
                        onOpenEnd: null,
                        onOpenStart: null,
                        outDuration: 250,
                      },
                    }}
                  >
                    <option value="0">Supervisor</option>
                    <option value="1">Promotor</option>
                  </select>
                </DivDetalhe>

                <DivDetalhe>
                  <Calendar
                    date={date}
                    onChange={(date) => {
                      this.setState({
                        forceLoading: true,
                        findDate: date,
                      });
                      onChangeDate(date).then(() => {
                        this.setState({
                          forceLoading: false,
                        });
                      });
                    }}
                  />
                </DivDetalhe>

                <DivDetalhe style={{ flexGrow: 1 }}>
                  <AlertsIndicator alerts={alerts} typeFilter={typeFilter} forceLoading={forceLoading} />
                </DivDetalhe>
                <DivDetalhe style={{ flexGrow: 1 }}>
                  <TradeDetailsIndicator data={dataSchedules} forceLoading={forceLoading} />
                </DivDetalhe>
                <DivDetalhe style={{ flexGrow: 1 }}>
                  <ClientsIndicator
                    data={clientsData}
                    dataSchedules={dataSchedules}
                    typeFilter={typeFilter}
                    forceLoading={forceLoading}
                  />
                </DivDetalhe>

                <DivFinal>
                  <DivDetalhe>
                    <Question
                      iconeBotaoPadrao={
                        <>
                          <Icon tiny>search</Icon>
                        </>
                      }
                      classeBotaoPadrao="saib-button is-circle searchButton"
                      textoBotaoPadrao=""
                      titulo="Localizar agendamento"
                      tituloBotaoSim="Fechar"
                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      tituloBotaoNao=""
                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close hidden"
                      message={<FindSchedule searchDate={findDate} />}
                      onNo={() => {}}
                      onYes={() => {}}
                    />
                  </DivDetalhe>

                  <DivDetalhe style={{ flexGrow: 1 }}>
                    <Link
                      to={{
                        pathname: '/TradePosition',
                        state: [{ lineClicked }],
                        usuarioAtivo,
                        empresaAtiva,
                      }}
                      className="saib-button is-primary"
                    >
                      <Icon>map</Icon>
                      <LabelUpdate>Posição atual</LabelUpdate>
                    </Link>
                  </DivDetalhe>
                </DivFinal>
              </>
            )}
          </>
        )}
      </Container>
    );
  }
}
