import React, { Component } from 'react';
import moment from 'moment';
import api from '../../../../services/api';
import Skeleton from 'react-loading-skeleton';

import { getFromStorage } from '../../../../services/auth';
import { alerta } from '../../../../services/funcoes';

import { RoutesIndicators } from '../../RoutesDashboard/RoutesIndicators';

import { SubContainer, SubContainerTitle } from './style';

export default class RoutesDashboard extends Component {
  state = {
    loading: false,
    changedFilterRoutes: 0,
    hiddenDashboard: false,
  };

  componentDidMount = async () => {
    // //console.log('componentDidMount');
    // //console.log(this.props);
    await this.carregarVariaveisEstado();
    this.handleAllDataUpdate();
    this.setState({ loading: true });
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const { changedFilterRoutes } = this.state;
    // //console.log('componentDidUpdate');
    // //console.log('=>this.props');
    // //console.log(this.props);
    // //console.log('this.state');
    // //console.log(this.state);
    if (
      this.props.changedFilter !== changedFilterRoutes &&
      !this.state.loading &&
      this.props.selectedFilter === 'day'
    ) {
      // //console.log('atualizando');
      this.handleAllDataUpdate();
    }
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  loadIndicatorsRoutes = async (data) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/dashboard/rotassaibgeodata/' + empresaAtiva + '/' + usuarioAtivo;

      let datas = {
        data,
        supervisores: this.getSelectedSupervisores()
      };
      // //console.log('datas');
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

  handleAllDataUpdate = async () => {
    this.setState({ loading: true });
    // //console.log('handleAllDataUpdate');
    let routesIndicators = await this.loadIndicatorsRoutes(
      moment(
        this.props.daySelected === undefined
          ? new Date()
          : this.props.daySelected
      ).format('DD/MM/yyyy')
    );
    // //console.log('routesIndicators');
    // //console.log(routesIndicators);
    let { changedFilterRoutes } = this.state;
    changedFilterRoutes =
      this.props.changedFilter !== undefined
        ? this.props.changedFilter
        : changedFilterRoutes;
    this.setState({ changedFilterRoutes, routesIndicators, loading: false });
  };

  getSelectedSupervisores = () => {
    return this.makeIn(
      this.props.supervisoresSelecionados,
      this.props.supervisores,
      'SUPERVISOR',
      'COD_SUPERVISOR_ID'
    );
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

  render() {
    const { routesIndicators, loading } = this.state;
    return (
      <>
        {this.props !== undefined && this.props.selectedFilter === 'day' && (
          <>
            {document.getElementsByTagName('body')[0].clientWidth < 768 ? (
              <SubContainerTitle>Indicadores vendedores</SubContainerTitle>
            ) : (
              <SubContainerTitle>Indicadores vendedores</SubContainerTitle>
            )}

            <SubContainer className="subContainerRoutes">
              {routesIndicators !== undefined && !loading ? (
                <RoutesIndicators
                  data={routesIndicators}
                  loading={loading ? 1 : 0}
                />
              ) : (
                <>
                  <Skeleton count={10} height={12} />
                </>
              )}
            </SubContainer>
          </>
        )}
      </>
    );
  }
}
