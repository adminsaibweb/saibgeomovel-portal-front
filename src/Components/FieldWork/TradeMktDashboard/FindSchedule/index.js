import React, { Component } from 'react';
import { Linha, Labels, DivDetalhe, ContentButtons, ContentTable } from './styled';
import { Icon } from 'react-materialize';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { formatDateTimeToBr, capitalize } from '../../../../services/funcoes';
import WaitScreen from '../../../Globals/WaitScreen';

export default class FindSchedule extends Component {
  state = {
    inputFind: '',
    items: [],
    loading: false,
  };
  componentDidMount = () => {
    this.carregarVariaveisEstado();
    //console.log('componentDidMount this.props', this.props);
    this.setState({ searchDate: this.props.searchDate });
  };

  componentDidUpdate = () => {
    let { searchDate } = this.state;
    if (searchDate !== this.props.searchDate) {
      this.setState({ searchDate: this.props.searchDate });
    }
  };

  onChangeInputFind = (e) => {
    this.setState({ inputFind: e.target.value });
  };

  onInputFindKeyPress = (e) => {
    if (e.charCode === 13) {
      this.loadFindedData();
    }
  };
  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
  };

  loadFindedData = async () => {
    try {
      this.setState({ loading: true });
      const { inputFind, empresaAtiva, usuarioAtivo, searchDate, gupFlagAgenda } = this.state;

      let postReq = {
        data: formatDateTimeToBr(searchDate, 'DD/MM/yyyy'),
        filtro: inputFind,
      };
      let retorno = await api.post(`/v1/tradedashboard/basics/find/${empresaAtiva}/${usuarioAtivo}`, postReq);
      let { sucess, data } = retorno.data;
      if (sucess) {
        this.setState({ items: gupFlagAgenda === 1 ? data.filter((dat) => dat.USR_ID === usuarioAtivo) : data });
        //console.log(data);
      }
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  clearFindedData = (e) => {
    this.setState({ inputFind: '', items: [] });
    document.getElementById('inputFind').focus();
  };

  render() {
    const { items, inputFind, loading } = this.state;
    const { isMobile } = this.props;
    return (
      <>
        <WaitScreen loading={loading} />
        <Linha style={{ width: '100%', alignItems: 'center' }}>
          <DivDetalhe style={{ alignItems: 'flex-start', flex: '3' }} width="100%">
            <Labels>Pesquisa</Labels>
            <input
              onChange={this.onChangeInputFind}
              value={inputFind}
              id="inputFind"
              autoComplete="off"
              onKeyPress={this.onInputFindKeyPress}
            />
          </DivDetalhe>
          <ContentButtons isMobile={isMobile}>
            <DivDetalhe style={{ flex: '1' }}>
              <span className="saib-button is-primary" onClick={this.clearFindedData}>
                <Icon>clear</Icon> Limpar
              </span>
            </DivDetalhe>
            <DivDetalhe style={{ flex: '1' }}>
              <span className="saib-button is-primary" onClick={this.loadFindedData}>
                <Icon>search</Icon> Filtrar
              </span>
            </DivDetalhe>
          </ContentButtons>
        </Linha>
        <ContentTable>
          <table className="striped findSchedule">
            <thead>
              <tr>
                <th>Pesquisador</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {items !== undefined &&
                items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <Labels>{item.USR_NOME}</Labels>{' '}
                    </td>
                    <td>
                      <Labels>{capitalize(item.CLI_NOME_FANTASIA, true)}</Labels>{' '}
                      <Labels fontSize={'0.8rem'}>({capitalize(item.CLI_RAZAO_SOCIAL, true)})</Labels>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </ContentTable>
      </>
    );
  }
}
