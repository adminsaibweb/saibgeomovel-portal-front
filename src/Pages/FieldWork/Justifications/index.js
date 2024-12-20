import React, { Component } from 'react';
import {
  Container,
  Linha,
  Labels,
  RowFilter,
  ContentInputFilter,
  LabelsFilter,
  ContentItem,
  LabelSituation,
  LinhaBtnsModal,
  ContentCard,
  DivDetalhe,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import { Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta, tratarErros } from '../../../services/funcoes';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import Skeleton from 'react-loading-skeleton';

export default class Justifications extends Component {
  state = {
    loading: false,
    justifications: [],
    optionFilterSituation: '0',
    optionFilterTypeJustification: '2',
    descriptionToFilter: '',
    optionPerCod: false,
    optionPerDescription: true,
    skeletonItem: [0, 1, 3, 4, 5, 6],
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.loadJustifications();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  setJustificationsPerFilter = () => {
    const { optionFilterSituation, allJustifications } = this.state;
    this.setState({
      loading: true,
    });

    let status;
    let response = allJustifications.map((justification) => justification);

    switch (optionFilterSituation) {
      case '1':
        status = 1;
        break;
      case '2':
        status = 0;
        break;
      default:
        break;
    }

    if (status !== undefined) {
      response = allJustifications.filter(
        (justification) =>
          justification.GAJ_FLG_STATUS === status && justification
      );
    }

    this.setState({
      justifications: response,
      loading: false,
    });
  };

  setSituationsPerDescriptionOrCode = async (ev) => {
    this.setState({
      descriptionToFilter: ev.target.value,
      loading: true,
    });
    const { justifications } = this.state;

    const justifications_ = [];

    if (ev.target.value === '') {
      this.setJustificationsPerFilter();
    } else if (this.state.optionPerDescription === true) {
      justifications.forEach((justification) => {
        if (
          String(justification.GAJ_DESCRICAO).includes(
            ev.target.value.toUpperCase()
          )
        ) {
          justifications_.push(justification);
        }
      });

      this.setState({
        justifications: justifications_,
      });
      if (justifications_.length === 0) this.loadJustifications();
    } else {
      ev.persist();
      const data_ = {
        codigoJustificativa: String(ev.target.value),
      };
      const res = await api.post(
        `v1/justification/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        data_
      );
      const { sucess, data } = res.data;
      const justifications_ = [];

      data.forEach((search) => {
        if (String(search.GAJ_DESCRICAO) !== 'null') {
          if (String(search.GAJ_ID).includes(ev.target.value)) {
            justifications_.push(search);
          }
        }
      });

      if (sucess) {
        this.setState({
          justifications: justifications_,
        });
      } else {
        tratarErros(res.data);
      }
    }
    this.setState({
      loading: false,
    });
  };

  handleOptionFilter = () => {
    this.state.optionPerCod === true
      ? this.setState({
          optionPerDescription: true,
          optionPerCod: false,
          descriptionToFilter: '',
        })
      : this.setState({
          optionPerDescription: false,
          optionPerCod: true,
          descriptionToFilter: '',
        });
  };

  onChangeRadioSituationJustification = () => {
    this.setJustificationsPerFilter();
  };

  loadJustifications = async () => {
    this.setState({
      loading: true,
    });
    try {
      const res = await api.post(
        `v1/justification/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`
      );
      const { data, sucess } = res.data;
      if (sucess) {
        this.setState({
          justifications: data,
          allJustifications: data,
        });
      }
    } catch (err) {
      //console.log(err);
    } finally {
      this.setState({
        loading: false,
      });
      // this.onChangeRadioSituationJustification();
      // this.onChangeRadioTypeJustification();
    }
  };

  handleActiveOrDisableJustification = async (justification) => {
    this.setState({
      loading: true,
    });
    justification.GAJ_FLG_STATUS === 0
      ? (justification.GAJ_FLG_STATUS = 1)
      : (justification.GAJ_FLG_STATUS = 0);
    try {
      const res = await api.put(
        `v1/justification/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        justification
      );
      const { sucess } = res.data;
      if (sucess) {
        alerta('Justificativa alterada com sucesso!', 1);
        this.loadJustifications();
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { loading, justifications, skeletonItem } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/justification'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Justificativas não atendimento
                </span>
              )
            }
          />

          <Linha className="filter">
            <Collapsible
              accordion={false}
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem
                expanded={false}
                header="Clique para filtrar"
                icon={<Icon>filter_list</Icon>}
                node="div"
              >
                <RowFilter>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"1","2","0"'}
                      classNameItems={'"itemActive","itemInative","allItems"'}
                      textItems={'"Ativa","Inativa","Todos"'}
                      idItems={'"active","inactivate","all2"'}
                      classNameRadio="filterSituation"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Situação Justificação"
                      defaultCheckedId={'all2'}
                      onChange={(value) => {
                        this.setState(
                          {
                            optionFilterSituation: value,
                          },
                          () => this.onChangeRadioSituationJustification()
                        );
                      }}
                    />
                  </ContentItem>
                </RowFilter>
                <ContentInputFilter className="input-field ">
                  <div>
                    <LabelsFilter fontWeight="500" fontSize="1.0rem">
                      Filtro por:
                    </LabelsFilter>
                    <div>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            className="radioToFilter"
                            name="group1"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerDescription}
                            defaultChecked={this.state.optionPerDescription}
                          />
                          <span>Nome da pesquisa</span>
                        </LabelsFilter>
                      </p>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            name="group1"
                            className="radioToFilter"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerCod}
                          />
                          <span>Codigo da pesquisa</span>
                        </LabelsFilter>
                      </p>
                    </div>
                  </div>
                  <div className="content-input">
                    <input
                      id="search"
                      type={this.state.optionPerCod ? 'number' : 'text'}
                      className="validate"
                      value={
                        this.state.descriptionToFilter
                          ? this.state.descriptionToFilter
                          : ''
                      }
                      onChange={(ev) => {
                        this.setSituationsPerDescriptionOrCode(ev);
                      }}
                    />
                    <i
                      className="small material-icons"
                      style={{ marginLeft: '10px' }}
                    >
                      search
                    </i>
                  </div>
                </ContentInputFilter>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <Linha>
            {justifications !== undefined && !loading ? (
              justifications
                .sort((a, b) => {
                  return a.GAJ_ID - b.GAJ_ID;
                })
                .map((item, i) => {
                  // if (item.GMI_TIPO_INTERRUPCAO !== null) {
                  //   //console.log('tese')
                  // }
                  return (
                    <ContentCard key={i}>
                      <div className="contentDescricao">
                        <Labels>
                          {item.GAJ_ID + ' - ' + item.GAJ_DESCRICAO}
                        </Labels>
                        {item.GAJ_FLG_STATUS === 1 ? (
                          <>
                            <LabelSituation fontWeight="500">
                              Ativa <Icon className="done">done</Icon>
                            </LabelSituation>
                          </>
                        ) : (
                          <>
                            <LabelSituation fontWeight="500">
                              Inativa<Icon className="close">close</Icon>
                            </LabelSituation>
                          </>
                        )}
                      </div>

                      <LinhaBtnsModal className="contentButtons">
                        <Link
                          className="saib-button is-primary view"
                          to={{
                            pathname: '/Justification',
                            state: {
                              justification: item,
                              action: 'editar',
                            },
                          }}
                        >
                          <Icon small>pageview</Icon>
                        </Link>
                        <Button
                          node="button"
                          title="Visualizar"
                          className="saib-button is-primary"
                          onClick={() => {
                            this.handleActiveOrDisableJustification(item);
                          }}
                        >
                          {item.GAJ_FLG_STATUS === 1 ? (
                            <LabelSituation color="#FFF" fontWeight="500">
                              <Icon small>block</Icon>
                              Destivar
                            </LabelSituation>
                          ) : (
                            <LabelSituation color="#FFF" fontWeight="500">
                              Ativar
                            </LabelSituation>
                          )}
                        </Button>
                      </LinhaBtnsModal>
                    </ContentCard>
                  );
                })
            ) : (
              <Linha>
                {skeletonItem.map((item) => (
                  <DivDetalhe
                    key={item}
                    style={{
                      boxShadow: '-1px 1px 5px 1px rgba(0,0,0,0.1)',
                      padding: '5px',
                      borderRadius: '10px',
                      width: '155px',
                      margin: '2px',
                    }}
                  >
                    <Skeleton height={200} />
                  </DivDetalhe>
                ))}
              </Linha>
            )}
          </Linha>
        </Container>
      </>
    );
  }
}
