import React, { Component } from 'react';
import { Container, DivDetalhe } from './styled';
import ListAlterts from './ListAlterts';
import PhotosList from './PhotosList';
import { alerta } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
export default class BottomMonitoring extends Component {
  state = {
    photosList: [],
    forceLoading: false,
    alertsUser: [],
    alertsDescription: []
  };
  async componentDidMount() {
    await this.carregarVariaveisEstado();
  }
  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  componentDidUpdate(prevProps) {
    const { dataSheduleSelected } = this.props;
    if (prevProps.dataSheduleSelected !== dataSheduleSelected) {
      if (this.props.dataSheduleSelected === '' || this.props.dataSheduleSelected === undefined) {
        this.setState({ photosList: [], userName: '', alertsUser: [] });
      } else {
        this.handlePhotosSchedules(dataSheduleSelected.GAA_ID);
      }
    }

    if (this.props.loading !== prevProps.loading) {
      this.setState({
        loading: this.props.loading,
      });
    }
  }

  handlePhotosSchedules = async (idSchedule) => {
    this.setState({
      loading: true,
    });
    const { dataSheduleSelected, alerts } = this.props;
    try {
      let { empresaAtiva, usuarioAtivo, alertsUser, alertsDescription } = this.state;
      alertsUser = []
      alertsDescription = []

      const getAlerts = await api.post(`v1/tradedashboard/alerts/${empresaAtiva}/${usuarioAtivo}`, {
        gaaId: dataSheduleSelected.GAA_ID
      })

      getAlerts.data.data.forEach(element => {
        let item = {}
        item.descricao = element.GTI_DESCRICAO
        item.gaaId = element.GAL_ID
        item.status = 0
        item.impede = element.GTI_FLG_IMPEDE_ATD
        item.userName = dataSheduleSelected.USR_NOME
        item.observation = element.GAL_OBSERVACAO
        alertsUser.push(item)
      })

      const alert = alerts.find(element => element.userName === dataSheduleSelected.USR_NOME && (element.descricao !== "" && element.descricao !== "Sim"))
      if(alert) {
        let item = {}
        item.descricao = alert.descricao
        item.gaaId = alert.gaaId
        item.status = 2
        item.impede = 0
        item.userName = dataSheduleSelected.USR_NOME
        alertsUser.push(item)
      }

      alertsUser.forEach(element => {
        const res = alertsDescription.find(item => item.descricao === element.descricao)
        if (!res) {
          let item = {}
          item.descricao = element.descricao
          item.gaaId = element.gaaId
          item.status = element.status
          item.impede = element.impede
          item.userName = element.userName
          item.observation = element.observation
          alertsDescription.push(item)
        }
      })

      this.setState({
        alertsUser,
        alertsDescription
      });
      const url = '/v1/tradedashboard/photolist/' + empresaAtiva + '/' + usuarioAtivo;
      let data = { gaaId: idSchedule };
      const retorno = await api.post(url, data);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let photosList = retorno.data.data;

          this.setState({
            photosList,
            loading: false,
            userName: dataSheduleSelected.USR_NOME
          });
        } else {
          return [];
        }
      }
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao carregar dados');
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { dataSheduleSelected, loading } = this.props;
    const { photosList, userName, alertsUser, alertsDescription } = this.state;

    return (
      <Container>
        {
          alertsUser.length > 0 &&
          <DivDetalhe flex="2" paddingRight="5px">
            <ListAlterts alerts={alertsUser} alertsDescription={alertsDescription} forceLoading={loading} />
          </DivDetalhe>
        }

        <DivDetalhe flex="6">
          <PhotosList
            withNavigation
            withBoxShadow
            heightFixed
            photosList={photosList}
            userName={userName}
            dataSheduleSelected={dataSheduleSelected}
            forceLoading={loading}
          />
        </DivDetalhe>
      </Container>
    );
  }
}
