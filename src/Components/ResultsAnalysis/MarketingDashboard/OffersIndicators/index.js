import React, { Component } from 'react';
import { Container, Linha, DivDetalhe } from './style';
import {
  Collapsible,
  CollapsibleItem,
  Button,
} from 'react-materialize';
import './forced.css';
import moment from 'moment';
import disappointedSalesWoman from '../../../../assets/images/disappointedsaleswoman.gif';
import {getMenuToStorage} from '../../../../services/auth';
import {withRouter} from 'react-router-dom';
export class OffersIndicators extends Component {
  state = { loading: false };
  componentDidMount = () => {
    // //console.log('this.props.data');
    // //console.log(this.props);
  };

  handleNewOffer = () =>{
    let menus = getMenuToStorage();
    const menu = menus.find((menu) => menu.DME_ID === 16);
    // const _class = menu.DME_CLASSE;
    const _link = menu.DME_URL;
    this.props.location.pathname = _link;
    this.props.history.push(_link);
    // this.props.history.go(_link);
    // this.props.history.go(EnviromentVars[_class]+_link);
    // window.location.href = EnviromentVars[_class]+_link;
  }
  render() {
    // const {
    //   globalChartConfig,
    //   globalChartTitle,
    //   selectedIndicator,
    // } = this.state;
    return (
      <Container>
        <Linha>
          {this.props.data !== undefined && this.props.data.length === 0 && (
            <div className="noOffer" style={{display: 'flex', flexDirection: 'column', width: '300px', alignItems: "center" }}>
              <img
                src={disappointedSalesWoman}
                alt={this.props.title}
                width={300}
              />
              <h6>Ops.. você não tem ofertas ativas</h6>
              <Button className="waves-effect waves-light saib-button is-call-to-action" onClick={this.handleNewOffer}>Crie uma nova oferta</Button>
            </div>
          )}

          {this.props.data.map((offer) => (
            <DivDetalhe className="offerBox" key={offer.POM_ID}>
              <Collapsible
                accordion={false}
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <CollapsibleItem
                  expanded={true}
                  header={
                    offer.TEXTO.toLowerCase() +
                    ' (' +
                    moment(offer.DATA_VIGENCIA).format('DD/MM/YYYY') +
                    ' - ' +
                    moment(offer.DATA_VALIDADE).format('DD/MM/YYYY') +
                    ')'
                  }
                  // icon={<Icon>filter_list</Icon>}
                  node="div"
                >
                  <DivDetalhe>
                    <Linha>
                      {offer.RAMOS_ATV.length > 0 && (
                          <DivDetalhe style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {offer.RAMOS_ATV.map((ramo) => (
                              <span
                                key={ramo.PRA_GEN_ID}
                                className="ramosAtividades"
                              >
                                {ramo.RAMO_ATV.toLowerCase()}
                              </span>
                            ))}
                          </DivDetalhe>
                      )}
                    </Linha>
                  </DivDetalhe>
                  <Linha style={{ display: 'flex' }}>
                    {offer.PRODUTOS !== undefined &&
                      offer.PRODUTOS.map((prod) => (
                        <DivDetalhe
                          style={{
                            margin: '0px 5px 0px 5px',
                            width: 'auto',
                            alignItems: 'center',
                          }}
                        >
                          <h6
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: '700',
                            }}
                          >
                            {prod.PROD_DESCR}
                          </h6>
                          <table key={prod.PROD_ID}>
                            <tbody>
                              <tr>
                                <td className="title">Valor</td>
                                <td className="value">
                                  {prod.VALOR + '' + prod.OFERTA_EM}
                                </td>
                              </tr>
                              <tr>
                                <td className="title">Limitada</td>
                                <td className="value">{prod.QTDE_LIMITE}</td>
                              </tr>
                              <tr>
                                <td className="title">Limitada/cliente</td>
                                <td className="value">
                                  {prod.QTDE_LIMITE_CLIENTE}
                                </td>
                              </tr>
                              <tr>
                                <td className="title">Usada</td>
                                <td className="value">{prod.QTDE_USADA}</td>
                              </tr>
                            </tbody>
                          </table>
                        </DivDetalhe>
                      ))}
                  </Linha>
                </CollapsibleItem>
              </Collapsible>
            </DivDetalhe>
          ))}
        </Linha>
      </Container>
    );
  }
}

export default withRouter(OffersIndicators);
