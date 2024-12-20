import React, { Component } from 'react';
import moment from 'moment';
import api from '../../../../services/api';
import Skeleton from 'react-loading-skeleton';

import { getFromStorage } from '../../../../services/auth';
import { alerta } from '../../../../services/funcoes';

import { ProductIndicators } from './ProductIndicators';

import {
  SubContainer,
  SubContainerTitle,
  DivDetalhe,
  Line,
  IndicatorsLine,
} from './style';

export default class ProductDashboard extends Component {
  state = {
    // daySelected: new Date(),
    loading: false,
    changedFilter: 0,
  };
  // state = {
  //   daySelected: new Date(),
  //   monthSelected: new Date(),
  //   dataFilterGroupPrior: -1,
  //   dataFilterGroup: 1,
  //   customSelectedInitial: 0,
  //   customSelectedEnd: 0,
  //   productIndicators: [],
  //   loadingFilter: true,
  //   vendedoresSelecionados: [],
  //   ramoAtividadeSelecionados: [],
  //   selectedFilter: '',
  //   origem: '',
  // };

  componentDidMount = async () => {
    // let { daySelected } = this.state;

    // //console.log('componentDidMount');
    // //console.log(this.props);
    await this.carregarVariaveisEstado();
    this.handleLoadDayData(new Date());
    this.setState({loading: true});
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const {changedFilter} = this.state;
    // //console.log(this.props);
    // //console.log(this.state.changedFilter);

    if ((this.props.changedFilter !== changedFilter) && (!this.state.loading)){
      this.handleAllDataUpdate();
    }
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

  loadIndicatorsProduct = async (startDate, finalDate, tipo) => {
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
        '/v1/dashboard/produtossaibgeodata/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
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
      // //console.log('retorno');
      // //console.log(retorno);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          result !== undefined &&
            result.length &&
            result.forEach((product) => {
              product.indicators.forEach((_indicator) => {
                if (tipo === 'day') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel = 'Dia anterior';
                  _indicator.actualLabel = 'Dia atual';
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }

                if (tipo === 'month') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel = 'Mês anterior';
                  _indicator.actualLabel = 'Mês atual';
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }

                if (tipo === 'custom') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel =
                    moment(_indicator.startDatePrior, 'DD/MM/YYYY').format(
                      'DD/MM'
                    ) +
                    ' á ' +
                    moment(_indicator.endDatePrior, 'DD/MM/YYYY').format(
                      'DD/MM'
                    );
                  _indicator.actualLabel =
                    moment(_indicator.startDate, 'DD/MM/YYYY').format('DD/MM') +
                    ' á ' +
                    moment(_indicator.endDate, 'DD/MM/YYYY').format('DD/MM');
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }
              });
            });
          // //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  getEstruturaAutorizada = () => {
    let inElements = "";

    if (this.props.estruturaAutorizada !== undefined){
      for (const element of this.props.estruturaAutorizada) {
        inElements += "'" + element["ESTR_ID"] + "',";
      }

      if (inElements !== '') {
        return inElements.substr(0, inElements.length - 1);
      }
    }
    return inElements;
  };

  getSelectedSupervisores = () => {
    return this.makeIn(
      this.props.supervisoresSelecionados,
      this.props.supervisores,
      'SUPERVISOR',
      'COD_SUPERVISOR_ID'
    );
  };

  handleLoadDayData = async (daySelected) => {
    this.setState({ loading: true});

    // //console.log('handleLoadDayData');
    let productIndicators = await this.loadIndicatorsProduct(
      moment(daySelected).format('DD/MM/yyyy'),
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );
    // //console.log('productIndicators');
    // //console.log(productIndicators);
    this.setState({
      productIndicators,
      loading: false,
    });
  };

  handleLoadMonthData = async (monthSelected) => {
    this.setState({ loading: true});
    // //console.log('handleLoadMonthData');
    let startDate = moment(monthSelected).startOf('month').format('DD/MM/YYYY');
    let endDate = moment(monthSelected).endOf('month').format('DD/MM/YYYY');
    let productIndicators = await this.loadIndicatorsProduct(
      startDate,
      endDate,
      'month'
    );
    this.setState({
      productIndicators,
      loading: false,
    });
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({ loading: true});
    // //console.log('handleLoadCustomDataEnd');
    let productIndicators = await this.loadIndicatorsProduct(
      moment(this.props.customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );

    this.setState({
      productIndicators,
      loading: false,
    });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({ loading: true});
    // //console.log('handleLoadCustomDataInitial');
    let productIndicators = await this.loadIndicatorsProduct(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(this.props.customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    this.setState({
    loading: false,
    productIndicators,
    });
  };

  handleAllDataUpdate =   () => {
    // //console.log('handleAllDataUpdate');
    if (this.props.selectedFilter === 'day') {
      this.handleLoadDayData(this.props.daySelected);
    }
    if (this.props.selectedFilter === 'month') {
      this.handleLoadMonthData(this.props.monthSelected);
    }
    if (this.props.selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(this.props.customSelectedInitial);
    }
    let {changedFilter} = this.state;
    changedFilter = this.props.changedFilter !== undefined ? this.props.changedFilter : changedFilter;
    this.setState({changedFilter});
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
    return this.makeIn(this.props.cidadesSelecionadas, this.props.cidades, 'CIDADE', 'CIDADE');
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

  render() {
    const { productIndicators, loading } = this.state;
    return (
      <>

        <SubContainerTitle>Indicadores produtos</SubContainerTitle>
        <SubContainer className="subContainerProduct">
          {productIndicators !== undefined ? (
            <ProductIndicators
              data={productIndicators}
              loading={loading ? 1 : 0}
            />
          ) : (
            <>
              <>
                <Line style={{ alignItems: 'inherit' }}>
                  <DivDetalhe style={{ padding: '20px' }}>
                    <Skeleton count={1} height={180} width={200} />
                  </DivDetalhe>
                  <IndicatorsLine style={{ width: '100%' }} loading={1}>
                    <Skeleton count={10} height={12} />
                  </IndicatorsLine>
                </Line>
              </>
            </>
          )}
        </SubContainer>
      </>
    );
  }
}
