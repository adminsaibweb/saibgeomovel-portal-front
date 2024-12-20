import React, { Component } from 'react';
import { MapContainer, ContentBodyModal, Linha, DivDetalhe } from '../../../../Pages/Supervisor/NotConformities/styled';
import api from '../../../../services/api';
import { alerta } from '../../../../services/funcoes';
import { getFromStorage } from '../../../../services/auth';
import MapNotConformitieWrapped from '../MapNotConformitie/MapNotConformitieWrapped';
import { Icon } from 'react-materialize';
import DirectTituloJanela from '../../../Globals/DirectTituloJanela';
import './forced.css';

export default class PopUpNotConformitie extends Component {
  state = {
    dataInconformities: undefined,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    // console.log('this.props', this.props);
    let { dataInconformities } = this.state;
    dataInconformities =
      this.props.history !== undefined &&
      this.props.history.location !== undefined &&
      this.props.history.location.state !== undefined
        ? this.props.history.location.state.dataInconformities
        : undefined;

    let wayPoints = [];
    let polilyne;
    if (dataInconformities !== undefined && dataInconformities.ID_NCFM === 7) {
      polilyne = {
        lat: Number(dataInconformities.LATITUDE_ANTERIOR.replace(',', '.')),
        lng: Number(dataInconformities.LONGITUDE_ANTERIOR.replace(',', '.')),
      };
      wayPoints.push(polilyne);
      polilyne = {
        lat: Number(dataInconformities.LATITUDE_ATUAL.replace(',', '.')),
        lng: Number(dataInconformities.LONGITUDE_ATUAL.replace(',', '.')),
      };
      wayPoints.push(polilyne);
    }
    this.setState({ dataInconformities, wayPoints });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    // console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  handleSave = async (idsIncoformities, aproval) => {
    try {
      let id = [];
      id.push(idsIncoformities);
      const dataToSend = {
        lacunaFechada: aproval,
        id,
      };
      const res = await api.post(
        `v1/ApprovalOfComercialRules/NotConformities/setstatus/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { sucess } = res.data;
      if (sucess) {
        idsIncoformities.length > 1
          ? alerta('Não conformidades alteradas com sucesso', 1)
          : alerta('Não conformidade alterada com sucesso', 1);

        this.props.history.goBack();
      } else {
        alerta('Erro ao salvar não conformidade');
      }
    } catch (error) {}
  };

  render() {
    const { wayPoints, dataInconformities } = this.state;
    return (
      <>
        <DirectTituloJanela
          classNameTitulo="mapWindowTitle"
          stateUrl={'/NotConformities'}
          titulo={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Icon>do_not_disturb_off</Icon>Não conformidades
            </span>
          }
        />
        {dataInconformities !== undefined && (
          <ContentBodyModal style={{ marginTop: '20px', marginLeft: '10px', marginRight: '10px' }}>
            <>
              <Linha>
                <DivDetalhe flex={2}>
                  <h5>
                    Deseja <span>aprovar</span> essa não conformidade ? <br />{' '}
                    <span>
                      {dataInconformities.DESCRICAO} - {dataInconformities.DESCR_NCFM}
                    </span>
                  </h5>
                  <p className="paragraphAction">Essa ação é irreversível! <span style={{fontWeight: '900'}}>({dataInconformities.NOME_FANTASIA})</span></p>
                </DivDetalhe>
              </Linha>
              <Linha style={{ justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button className="saib-button is-primary" onClick={() => this.handleSave(dataInconformities.ID, true)}>
                  Sim
                </button>{' '}
                &nbsp;&nbsp;&nbsp;
                <button className="saib-button is-primary" onClick={() => this.props.history.goBack()}>
                  Não
                </button>{' '}
                &nbsp;&nbsp;&nbsp;
              </Linha>
              {dataInconformities.ID_NCFM === 7 && (
                <>
                  <MapContainer className="mapContainer" style={{ height: 'calc(100vh - 120px)' }}>
                    <MapNotConformitieWrapped
                      googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBdN4niRiYdhPBIxEny9lGB-OpBJ0NPpnY`}
                      loadingElement={<div style={{ height: `100%` }} />}
                      containerElement={<div style={{ height: `100%` }} />}
                      mapElement={<div style={{ height: `100%` }} />}
                      wayPoints={wayPoints}
                      data={dataInconformities}
                    />
                  </MapContainer>
                </>
              )}
            </>
          </ContentBodyModal>
        )}
      </>
    );
  }
}
