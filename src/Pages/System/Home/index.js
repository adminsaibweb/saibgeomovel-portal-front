import React, { Component } from 'react';
import Header from '../../../Components/System/Header';
import { getFromStorage } from '../../../services/auth';
import { withRouter } from 'react-router-dom';
import KpiDashboard from '../../ResultsAnalysis/KpiDashboard';
import Trade from '../../Trade/Home';

class Home extends Component {
  state = {
    loading: false,
    frotaId: undefined,
    gmovelTrade: undefined,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    //console.log('sessao');
    //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      frotaId: sessao.frotaId === undefined ? '-1' : sessao.frotaId,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
    });
  };

  render() {
    let { gmovelTrade,  gmovelSupervisor } = this.state;
    return (
      <>
        <Header />
        {gmovelTrade !== undefined && (
          <>
            {gmovelTrade ? (
              <>
                <Trade {...this.props} />
                {gmovelSupervisor ? (
                  <>
                    <KpiDashboard {...this.props} fromHome={true} />
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <KpiDashboard {...this.props} fromHome={true} />
            )}
          </>
        )}
        {/* {frotaId !== undefined && (
          frotaId === '-1' ? <React.Fragment> <Trade  {...this.props} /> </React.Fragment> : <LogisticsHome {...this.props} />
        )} */}
      </>
    );
  }
}

export default withRouter(Home);
