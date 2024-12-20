import React, { Component } from 'react';
import { Container, Linha, DivDetalhe } from './style';
import { Collapsible, CollapsibleItem, Button } from 'react-materialize';
import './forced.css';
import moment from 'moment';
import disappointedSalesWoman from '../../../../assets/images/disappointedsaleswoman.gif';
import { getMenuToStorage } from '../../../../services/auth';
import { withRouter } from 'react-router-dom';
export class VouchersIndicators extends Component {
  state = { loading: false };
  componentDidMount = () => {
  };

  handleNewVoucher = () => {
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
              <h6>Ops.. você não tem vouchers ativos</h6>
              <Button
                className="waves-effect waves-light saib-button is-call-to-action"
                onClick={this.handleNewVoucher}
              >
                Crie um novo voucher
              </Button>
            </div>
          )}

          {this.props.data.map((voucher) => (
            <DivDetalhe className="offerBox" key={voucher.POM_ID}>
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
                    voucher.TEXTO.toLowerCase() +
                    ' (' +
                    moment(voucher.DATA_VIGENCIA).format('DD/MM/YYYY') +
                    ' - ' +
                    moment(voucher.DATA_VALIDADE).format('DD/MM/YYYY') +
                    ')'
                  }
                  // icon={<Icon>filter_list</Icon>}
                  node="div"
                >
                  <Linha style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <span
                      style={{
                        color: '#444141',
                        fontWeight: '700',
                        padding: '5px',
                        background:
                          'rgba(97, 9, 138, 0.02) none repeat scroll 0% 0%',
                        // marginRight: '10px',
                      }}
                    >
                      {voucher.TIPO} &nbsp;com&nbsp;{' '}
                      {voucher.VALOR + '' + voucher.OFERTA_EM}
                    </span>
                    <span
                      style={{
                        color: '#444141',
                        fontWeight: '700',
                        padding: '5px',
                        background:
                          'rgba(97, 9, 138, 0.02) none repeat scroll 0% 0%',
                      }}
                    >
                      Oportunidades: &nbsp; {voucher.OPORTUNIDADES}
                    </span>
                  </Linha>
                  <Linha style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <h6
                      style={{
                        color: '#444141',
                        fontWeight: '700',
                        padding: '5px',
                        background:
                          'rgba(97, 9, 138, 0.05) none repeat scroll 0% 0%',
                        width: '100%',
                      }}
                    >
                      Ramos atividades
                    </h6>
                  </Linha>
                  <Linha>
                    {voucher.RAMOS_ATV.length > 0 && (
                      <DivDetalhe
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          maxWidth: '100%',
                          flexWrap: 'wrap',
                        }}
                      >
                        {voucher.RAMOS_ATV.map((ramo) => (
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
                  {voucher.TIPO === 'Voucher' && voucher.PRODUTOS.length > 0 && voucher.PRODUTOS[0].PROD_DESCR != null &&(
                    <>
                      <Linha
                        style={{ marginTop: '10px', marginBottom: '10px' }}
                      >
                        <h6
                          style={{
                            color: '#444141',
                            fontWeight: '700',
                            padding: '5px',
                            background:
                              'rgba(97, 9, 138, 0.08) none repeat scroll 0% 0%',
                            width: '100%',
                          }}
                        >
                          Produtos obrigatórios {voucher.PRODUTOS.length}
                        </h6>
                      </Linha>
                      <Linha style={{ display: 'flex' }}>
                        <DivDetalhe
                          style={{
                            flexDirection: 'row',
                            width: '100%',
                            maxWidth: '100%',
                            flexWrap: 'wrap',
                          }}
                        >
                          {voucher.PRODUTOS !== undefined &&
                            voucher.PRODUTOS.map((prod) => (
                              <span className="ramosAtividades">
                                {prod.PROD_DESCR != null && prod.PROD_DESCR !== '' ? prod.PROD_DESCR.toLowerCase() : ''}
                              </span>
                            ))}
                        </DivDetalhe>
                      </Linha>
                    </>
                  )}
                </CollapsibleItem>
              </Collapsible>
            </DivDetalhe>
          ))}
        </Linha>
      </Container>
    );
  }
}

export default withRouter(VouchersIndicators);
