import React, { Component } from 'react';
import { Container, Linha, DivDetalhe } from './style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import './forced.css';
import disappointedSalesWoman from '../../../../assets/images/disappointedsaleswoman.gif';
import { getMenuToStorage } from '../../../../services/auth';
import { withRouter } from 'react-router-dom';
import {formatFloatBr} from '../../../../services/funcoes';

export class CoastCenterIndicators extends Component {
  state = { loading: false };
  componentDidMount = () => {};

  handleNewCoastCenter = () => {
    let menus = getMenuToStorage();
    //console.log(menus);
    const menu = menus.find((menu) => menu.DME_ID === 14);
    // const _class = menu.DME_CLASSE;
    const _link = menu.DME_URL;
    this.props.history.push(_link);
  };
  
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
            <div
              className="noOffer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
                alignItems: 'center',
              }}
            >
              <img
                src={disappointedSalesWoman}
                alt={this.props.title}
                width={300}
              />
              <h6>Ops.. você não tem verbas disponíveis para os centros de custos</h6>
            </div>
          )}

          {this.props.data.map((month) => (
            <DivDetalhe className="offerBox" key={month.DVM_ID}>
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
                  header={month.MES}
                  // icon={<Icon>filter_list</Icon>}
                  node="div"
                >
                  <Linha style={{ display: 'flex', flexDirection: 'row' }}>
                    {month.CENTRO_CUSTO !== undefined &&
                      month.CENTRO_CUSTO.map((coastCenter) => (
                        <DivDetalhe
                          key={coastCenter.DCC_ID}
                          style={{
                            margin: '2px',
                            maxWidth: '150px',
                            alignItems: 'center',
                          }}
                        >
                          <h6
                            style={{
                              color: '#444141',
                              fontWeight: '700',
                              padding: '5px',
                              background:
                                'rgba(97, 9, 138, 0.05) none repeat scroll 0% 0%',
                              width: '100%',
                              textTransform: 'capitalize',
                            }}
                          >
                            {'('+ coastCenter.DCC_SIGLA.toLowerCase()+') '+ coastCenter.DCC_NOME.toLowerCase()}
                          </h6>
                          <table style={{marginTop: 'auto'}}>
                            <tbody>
                              <tr title="Verba aprovada">
                                <td className="titleApproved"><Icon>check</Icon></td>
                                <td className="valueApproved">
                                  {formatFloatBr(coastCenter.DVM_VERBA_APROV)}
                                </td>
                              </tr>
                              <tr title="Verba NÃO aprovada">
                                <td className="titleNotApproved"><Icon>cancel</Icon></td>
                                <td className="valueNotApproved">{formatFloatBr(coastCenter.DVM_VERBA_NAO_APROV)}</td>
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

export default withRouter(CoastCenterIndicators);
