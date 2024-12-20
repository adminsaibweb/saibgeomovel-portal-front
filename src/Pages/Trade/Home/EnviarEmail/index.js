import React, { Component } from 'react';
import {uploadScheduleDay} from '../tradeGlobalFunctions';
import { getFromStorage } from '../../../../services/auth';
import { haveData, alerta } from '../../../../services/funcoes';
import { withRouter } from 'react-router-dom';

const LocalEnviarEmail = ({ email, subject, body, ...props }) => {

    let params = subject || body ? '?' : '';
    if (subject) params += `subject=${encodeURIComponent(subject)}`;
    if (body) params += `${subject ? '&' : ''}body=${encodeURIComponent(body)}`;

    return <a href={`mailto:${email}${params}`}>{props.children}</a>;
};

class EnviarEmail extends Component {
  state = { scheduleData: '' };
  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    let { scheduleData, empresaCnpj, usuarioAtivo } = this.state;
    scheduleData = await uploadScheduleDay(empresaCnpj, usuarioAtivo);
    if(haveData(scheduleData.error)){
      alerta('Erro ao fazer o upload do banco local.\n'+scheduleData.error, 1);
      this.props.history.goBack();
    }
    // this.setState({ scheduleData: JSON.stringify(scheduleData) });
    this.setState({ scheduleData: scheduleData.urlPath});
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  render() {
    const { scheduleData } = this.state;
    return (
      <>
        {scheduleData !== undefined && (
          <LocalEnviarEmail
            email="junior@saibweb.com.br"
            subject="Trade Marketing"
            body={scheduleData}
          >
            Enviar email{' '}
          </LocalEnviarEmail>
        )}
      </>
    );
  }
}

export default withRouter(EnviarEmail);
