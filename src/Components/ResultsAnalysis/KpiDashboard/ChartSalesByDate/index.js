import React, { Component } from 'react';
import { Container, Linha,  } from './style';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import { getFromStorage } from '../../../../services/auth';
import Skeleton from 'react-loading-skeleton';
import { alerta, roundTwoDecimals } from '../../../../services/funcoes';
import api from '../../../../services/api';

export class ChartSalesByDate extends Component {
  state = {
    daySelected: new Date(),
    dataSalesByTime: undefined,
    selectedIndicator: -1,
    loading: true,
  };

  makeConfigChart = (
    indicator,
    priorData,
    actualData,
    priorLabel,
    actualLabel,
    legend,
    legendXLabel,
    legendYLabel,
    format
  ) => {
    const data = {
      labels: [priorLabel, actualLabel],
      datasets: [
        {
          data: [priorData, actualData],
          backgroundColor: ['rgb(189, 32, 123)', 'rgb(97, 9, 138)'],
          hoverBackgroundColor: ['rgb(189, 32, 123)', 'rgb(97, 9, 138)'],
        },
      ],
    };
    return data;
  };

  componentDidMount = async () => {
    this.setState({ loading: true });
    await this.carregarVariaveisEstado();
    // this.handleLoadMonthData(new Date());
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    // //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  componentDidUpdate = () => {
    const { changedFilter } = this.state;
    // //console.log('componentDidUpdate');
    // //console.log(this.props);
    // //console.log('=>componentDidUpdate');
    if (this.props.changedFilter !== changedFilter) {
      this.handleAllDataUpdate();
    }
  };

  handleMakeGlobalGraph = (indicatorGraph) => {
    // let { indicatorGraph } = this.state;
    // //console.log(indicatorGraph);
    if (
      indicatorGraph === undefined &&
      this.props.data !== undefined &&
      this.props.data.length > 0
    ) {
      indicatorGraph = this.props.data[0];
      this.setState({ indicatorGraph });
    }

    let globalChartTitle = indicatorGraph.title;
    let selectedIndicator = parseInt(indicatorGraph.id);

    this.setState({ globalChartTitle, selectedIndicator });

    const config = this.makeConfigChart(
      indicatorGraph.legend,
      indicatorGraph.prior,
      indicatorGraph.value,
      indicatorGraph.priorLabel,
      indicatorGraph.actualLabel,
      indicatorGraph.legend,
      indicatorGraph.legendXLabel,
      indicatorGraph.legendYLabel,
      indicatorGraph.format
    );
    // //console.log('config');
    // //console.log(config);
    return config;
  };

  handleMakeGlobalGraphTitle = (indicatorGraph) => {
    // let { indicatorGraph } = this.state;
    // if (
    //   indicatorGraph === undefined &&
    //   this.props.data !== undefined &&
    //   this.props.data.length > 0
    // ) {
    //   indicatorGraph = this.props.data[0];
    //   this.setState({ indicatorGraph });
    // }
    return indicatorGraph.title;
  };

  handleChangeIndicatorGraph = (indicatorGraph) => {
    let dataSalesByTime = this.handleMakeGlobalGraph(indicatorGraph);
    // //console.log(dataSalesByTime);
    this.setState({ dataSalesByTime });
  };

  loadSalesByData = async (startDate, finalDate, tipo) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      let vendedores, ramosAtividades, cidades;
      vendedores = this.getSelectedVendedores();
      ramosAtividades = this.getSelectedRamosAtividades();
      cidades = this.getSelectedCidades();

      // //console.log('cidades');
      // //console.log(cidades);
      // //console.log('ramosAtividades');
      // //console.log(ramosAtividades);
      // //console.log('vendedores');
      // //console.log(vendedores);

      const url =
        '/v1/dashboard/salesbyday/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);

      let datas = {
        startDate,
        finalDate,
        cidades,
        ramosAtividades,
        vendedores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        supervisores: this.getSelectedSupervisores(),
        tipo,
      };
      // //console.log(datas);

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          let counter = 1;
          for (const route of result) {
            route.counter = counter;
            counter += 1;
          }
          //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      // this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  loadSalesByTime = async (startDate, tipo) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      let vendedores, ramosAtividades, cidades;
      vendedores = this.getSelectedVendedores();
      ramosAtividades = this.getSelectedRamosAtividades();
      cidades = this.getSelectedCidades();

      // //console.log('cidades');
      // //console.log(cidades);
      // //console.log('ramosAtividades');
      // //console.log(ramosAtividades);
      // //console.log('vendedores');
      // //console.log(vendedores);

      const url =
        '/v1/dashboard/salesbytime/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);

      let datas = {
        startDate,
        cidades,
        ramosAtividades,
        vendedores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        supervisores: this.getSelectedSupervisores(),
        tipo,
      };
      //console.log(datas);

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          let counter = 1;
          for (const route of result) {
            route.counter = counter;
            counter += 1;
          }
          //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      // this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  getSelectedSupervisores = () => {
    return this.makeIn(
      this.props.supervisoresSelecionados,
      this.props.supervisores,
      'SUPERVISOR',
      'COD_SUPERVISOR_ID'
    );
  };

  getEstruturaAutorizada = () => {
    let inElements = '';

    if (this.props.estruturaAutorizada !== undefined) {
      for (const element of this.props.estruturaAutorizada) {
        inElements += "'" + element['ESTR_ID'] + "',";
      }

      if (inElements !== '') {
        return inElements.substr(0, inElements.length - 1);
      }
    }
    return inElements;
  };

  handleLoadDayData = async (daySelected) => {
    this.setState({ loading: true });

    // //console.log('handleLoadDayData');
    let salesByTimeData = await this.loadSalesByTime(
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );
    // //console.log('salesByTimeData');
    // //console.log(salesByTimeData);
    this.prepareData(salesByTimeData);
    this.setState({
      salesByTimeData,
      // loading: false,
    });
  };

  prepareData = async (salesByTimeData) => {
    // let {salesByTimeData} = this.state;
    if (salesByTimeData === undefined) {
      return;
    }
    let dataSalesByTime = {};
    dataSalesByTime.labels = [];
    dataSalesByTime.datasets = [
      {
        label: 'Vendas por dia',
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgb(189, 32, 123)',
        borderColor: 'rgb(189, 32, 123,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgb(189, 32, 123,1)',
        pointBackgroundColor: 'rgb(189, 32, 123)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgb(189, 32, 123, 0.9)',
        pointHoverBorderColor: 'rgb(189, 32, 123, 0.8)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [],
      },
    ];
    for (const sales of salesByTimeData) {
      dataSalesByTime.labels.push(sales.DATA);
      dataSalesByTime.datasets[0].data.push(roundTwoDecimals(sales.TOTAL_DIA));
    }

    this.setState({ dataSalesByTime });
  };

  handleLoadMonthData = async (monthSelected) => {
    this.setState({ loading: true });
    // //console.log('handleLoadMonthData');
    let startDate = moment(monthSelected).startOf('month').format('DD/MM/YYYY');
    let endDate = moment(monthSelected).endOf('month').format('DD/MM/YYYY');
    // //console.log('startDate');
    // //console.log(startDate);
    // //console.log('endDate');
    // //console.log(endDate);
    let salesByTimeData = await this.loadSalesByData(
      startDate,
      endDate,
      'month'
    );
    // //console.log('salesByTimeData');
    // //console.log(salesByTimeData);
    this.prepareData(salesByTimeData);
    this.setState({
      salesByTimeData,
      // loading: false,
    });
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({ loading: true });
    // //console.log('handleLoadCustomDataEnd');
    let salesByTimeData = await this.loadSalesByData(
      moment(this.props.customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    this.prepareData(salesByTimeData);

    this.setState({
      salesByTimeData,
      // loading: false,
    });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({ loading: true });
    // //console.log('handleLoadCustomDataInitial');
    let salesByTimeData = await this.loadSalesByData(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(this.props.customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    this.prepareData(salesByTimeData);
    this.setState({
      // loading: false,
      salesByTimeData,
    });
  };

  handleAllDataUpdate = () => {
    this.setState({ loading: true });
    if (this.props.selectedFilter === 'day') {
      this.handleLoadMonthData(this.props.daySelected);
    }
    if (this.props.selectedFilter === 'month') {
      this.handleLoadMonthData(this.props.monthSelected);
    }
    if (this.props.selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(this.props.customSelectedInitial);
    }
    let { changedFilter } = this.state;
    changedFilter =
      this.props.changedFilter !== undefined
        ? this.props.changedFilter
        : changedFilter;
    this.setState({ changedFilter, loading: false });
  };

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      const _element = elements.find(
        (elemento) => elemento[searchText] === element.tag
      );
      if (_element !== undefined) {
        if (!isNaN(_element[searchKey])) {
          inElements += _element[searchKey] + ',';
        } else {
          inElements += "'" + _element[searchKey] + "',";
        }
      }
    }
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };

  getSelectedVendedores = () => {
    // let { vendedoresSelecionados, vendedores } = this.state;
    return this.makeIn(
      this.props.vendedoresSelecionados,
      this.props.vendedores,
      'VENDEDOR',
      'VENDEDOR_ID'
    );
  };

  getAllVendedores = () => {
    // const { vendedores } = this.state;
    let vendedoresFiltro = '';
    for (const vendedor of this.props.vendedores) {
      vendedoresFiltro += "'" + vendedor.VENDEDOR_ID + "',";
    }
    return vendedoresFiltro.substr(0, vendedoresFiltro.length - 1);
  };

  getSelectedRamosAtividades = () => {
    // let { ramosAtividadesSelecionados, ramosAtividades } = this.state;
    return this.makeIn(
      this.props.ramosAtividadesSelecionados,
      this.props.ramosAtividades,
      'RAMO',
      'RAMO_ID'
    );
  };

  getSelectedCidades = () => {
    // let { cidadesSelecionadas, cidades } = this.state;
    return this.makeIn(
      this.props.cidadesSelecionadas,
      this.props.cidades,
      'CIDADE',
      'CIDADE'
    );
  };

  getAllRamosAtividades = () => {
    // const { ramosAtividades } = this.state;
    let ramosAtividadesFiltro = '';
    for (const ramo of this.props.ramosAtividades) {
      ramosAtividadesFiltro += "'" + ramo.RAMO_ID + "',";
    }
    return ramosAtividadesFiltro.substr(0, ramosAtividadesFiltro.length - 1);
  };

  getAllCidades = () => {
    // const { cidades } = this.state;
    let cidadesFiltro = '';

    for (const cidade of this.props.cidades) {
      cidadesFiltro += "'" + cidade.CIDADE + "',";
    }
    return cidadesFiltro.substr(0, cidadesFiltro.length - 1);
  };

  getHeaderRoute = (route) => {
    return route.ESTR_DESCR_ROTA;
  };

  render() {
    const { dataSalesByTime, loading } = this.state;
    return (
      <>
        {this.props.loading || loading ? (
          <Skeleton count={5} height={20} />
        ) : (
          <>
            <Container className="salesByDay">
              <Linha>
                {dataSalesByTime !== undefined && (
                  <Line
                    data={dataSalesByTime}
                    id="globalChart"
                    options={{
                      maintainAspectRatio: true,
                    }}
                  />
                )}
              </Linha>
            </Container>
          </>
        )}
      </>
    );
  }
}

export default ChartSalesByDate;
