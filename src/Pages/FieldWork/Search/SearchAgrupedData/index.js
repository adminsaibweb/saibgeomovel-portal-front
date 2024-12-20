import React, { Component } from 'react';
import { Button, Checkbox, Icon, Modal } from 'react-materialize';
import { alerta, capitalize } from '../../../../services/funcoes';
import {
  Linha,
  DivDetalhe,
  Container,
  Labels,
  ContentModal,
  ContentBodyModal,
  ContentAgroupeds,
  ContentAgrouped,
  ContentBtnAddNewAgrouped,
  ContentDescriptionAgrouped,
  ContentItemsInModal,
  EachItemModal,
  ContentInputs,
  IconContainer,
  LinhaTitleItensAgrupamento,
} from './styled';
import * as Yup from 'yup';
import './forced.css';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
export default class SearchAgrupedData extends Component {
  state = {
    shortDescriptionAgruped: '',
    longDescriptionAgruped: '',
    shortDescriptionItem: '',
    longDescriptionItem: '',
    GGI_FLG_ORIGATORIA_NAO_APLICA: 0,
    positionItem: 0,
    groupedSelected: {
      ITEMS: [],
    },
    groupings: [],
    openModal: false,
    addItem: false,
    removeGrouped: false,
    loading: false,
    idDelete: null,
  };

  componentDidMount() {
    const { action } = this.props;
    this.setState({
      action,
    });
    if (action === 'editar') {
      this.handleDataAgrupeds();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.handleDataAgrupeds();
    }
  }

  handleDataAgrupeds = () => {
    const { data } = this.props;
    const agruped = data && data;
    data &&
      this.setState({
        grouping: agruped,
        shortDescriptionAgruped: '',
        longDescriptionAgruped: '',
        groupings: agruped.map((group) => {
          group.idTemporary = group.GGR_ID;
          group.ITEMS.forEach((item) => {
            item.idItemTemporary = item.GGI_ID;
          });
          return group;
        }),
      });
  };

  handleAddNewItemInGruped = () => {
    this.setState({
      action: 'novo',
      openModal: true,
      addItem: true,
    });
  };

  handleAddNewGrouped = () => {
    this.setState({
      action: 'novo',
      actionAgruped: 'novo',
      openModal: true,
    });
  };

  handleEditItemAgruped = (itemToEdit) => {
    this.setState({
      isEditItem: true,
      idItem: itemToEdit.GGI_ID,
      shortDescriptionItem: itemToEdit.GGI_DESCRICAO,
      longDescriptionItem: itemToEdit.GGI_DESCRICAO_LONGA,
      positionItem: itemToEdit.GGI_POSICAO,
      action: 'editar',
      itemToEdit,
      GGI_FLG_ORIGATORIA_NAO_APLICA: itemToEdit.GGI_FLG_ORIGATORIA_NAO_APLICA,
      // itemToEdit,
      // items: newsItems,
    });
  };

  handleEditAgruped = (itemToEdit) => {
    // const { groupings } = this.state;
    // const newsItems = groupings.filter((item) => item !== itemToEdit);
    this.setState({
      idAgrouped: itemToEdit.GGR_ID,
      shortDescriptionAgruped: itemToEdit?.GGR_DESCRICAO,
      longDescriptionAgruped: itemToEdit?.GGR_DESCRICAO_LONGA,
      openModal: true,
      actionAgruped: 'editar',
      action: 'editar',
      groupedSelected: itemToEdit,
      GGI_FLG_ORIGATORIA_NAO_APLICA: itemToEdit.GGI_FLG_ORIGATORIA_NAO_APLICA,
      // items: newsItems,
    });
  };

  handleDeleteGrouping = async (id) => {
    try {
      const { deleteGrouping } = this.props;
      const { groupings } = this.state;
      this.setState({ loading: true });
      const sessao = getFromStorage();

      const res = await api.delete(`v1/searchs/group/${sessao.empresaId}/${sessao.codigoUsuario}/${id}`);

      const { sucess, message } = res.data;

      if (sucess) {
        alerta(message, 1);
        const updateArray = groupings.filter(e => e.GGR_ID !== id)
        this.setState({ groupings: updateArray })
        deleteGrouping(id)
      } else {
        alerta(message, 2);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      this.setState({ loading: false, removeGrouped: false, idDelete: null });
    }
  };

  handleValidationData = async () => {
    let retorno = await this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) => {
        return true;
      })
      .catch((err) => {
        const errors = this.getValidationErrors(err);

        this.setState({
          errors,
        });
        return false;
      });
    return retorno;
  };

  handleValidationUnicField = (nameField, errorPage) => {
    this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) =>
        this.setState({
          [errorPage]: {},
        })
      )
      .catch((err) => {
        const errors_ = this.getValidationErrors(err);
        for (var error in errors_) {
          if (error !== nameField) {
            delete errors_[error];
          }
          if (errors_[error] === undefined) {
            delete errors_[error];
          }
        }

        this.setState(
          (prevState) => ({
            [errorPage]: {
              ...prevState[errorPage],
              [nameField]: errors_[[nameField]], //[]é para acessar o nome da propriedade do valor, [[]] é para acessar a o valor da propriedade
            },
          }),
          () => {
            if (this.state[errorPage][nameField] === undefined) {
              const errorsAux = this.state[errorPage];
              delete errorsAux[nameField];
              this.setState({
                [errorPage]: errorsAux,
              });
            }
          }
        );
      });
  };

  getValidationErrors = (err) => {
    const validationErrors = {};

    err.inner?.length > 0 &&
      err.inner.forEach((error) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });

    return validationErrors;
  };

  cleanStatesEdited = () => {
    this.setState({
      idItem: null,
      addItem: false,
      shortDescriptionItem: '',
      longDescriptionItem: '',
      shortDescriptionAgruped: '',
      longDescriptionAgruped: '',
      positionItem: '',
      itemToEdit: null,
      isEditItem: false,
      errors: {},
      groupedSelected: {
        ITEMS: [],
      },
      // items: newsItems,
    });
  };

  setDataInGroup = async () => {
    const { shortDescriptionAgruped, longDescriptionAgruped, groupings, groupedSelected } = this.state;
    const { handleItemsInSearch } = this.props;

    const newsGroupings = groupings.filter((grouping_) => {
      if (groupedSelected.idTemporary && grouping_.idTemporary) {
        if (grouping_.idTemporary !== groupedSelected.idTemporary) return grouping_;
        else return '';
      } else if (grouping_.GGR_ID !== groupedSelected.GGR_ID) return grouping_;
      else return grouping_;
    });

    groupedSelected.GGR_DESCRICAO = shortDescriptionAgruped;
    groupedSelected.GGR_DESCRICAO_LONGA = longDescriptionAgruped;
    newsGroupings.push(groupedSelected);

    handleItemsInSearch(newsGroupings);
    this.setState({
      groupings: newsGroupings,
    });
  };

  handleSaveAgrouped = async () => {
    const {
      longDescriptionAgruped,
      shortDescriptionAgruped,
      groupedSelected,
      groupings,
      shortDescriptionItem,
      longDescriptionItem,
      actionAgruped,
      GGI_FLG_ORIGATORIA_NAO_APLICA,
    } = this.state;
    const { handleItemsInSearch } = this.props;

    if (actionAgruped === 'editar') {
      if (
        !this.state.groupings.every((grouping) => (grouping.idTemporary === groupedSelected.idTemporary ? false : true)) //ja existe então deve  atualiza-lo
      ) {
        const newGroupings = groupings.filter(
          (grouping) => grouping.idTemporary !== groupedSelected.idTemporary && grouping
        );
        let grouping;
        if (groupedSelected.GGR_ID) {
          grouping = {
            idTemporary: groupedSelected.GGR_ID ? groupedSelected.GGR_ID : groupedSelected.idTemporary,
            GGR_ID: groupedSelected.GGR_ID,
            GGR_DESCRICAO: shortDescriptionAgruped,
            GGR_DESCRICAO_LONGA: longDescriptionAgruped,
            ITEMS: groupedSelected.ITEMS,
          };
        } else {
          grouping = {
            idTemporary: groupedSelected.GGR_ID ? groupedSelected.GGR_ID : groupedSelected.idTemporary,
            GGR_DESCRICAO: shortDescriptionAgruped,
            GGR_DESCRICAO_LONGA: longDescriptionAgruped,
            ITEMS: groupedSelected.ITEMS,
          };
        }
        newGroupings.push(grouping);

        this.setState(
          {
            groupings: newGroupings,
          },
          async () => await handleItemsInSearch(this.state.groupings)
        );
      } else {
        this.setState(
          (prevState) => ({
            groupings: [...prevState.groupings, groupedSelected].sort((a, b) => {
              return a.GGR_ID - b.GGR_ID;
            }),
          }),
          async () => await handleItemsInSearch(this.state.groupings)
        );
      }
    } else {
      const agrouped = {
        idTemporary: groupings.length + 1,
        GGR_DESCRICAO: shortDescriptionAgruped,
        GGR_DESCRICAO_LONGA: longDescriptionAgruped,
        ITEMS: [
          {
            idItemTemporary: 1,
            GGI_POSICAO: 1,
            GGI_DESCRICAO: shortDescriptionItem && shortDescriptionItem.toUpperCase(),
            GGI_DESCRICAO_LONGA: longDescriptionItem && longDescriptionItem.toUpperCase(),
            GGI_FLG_ORIGATORIA_NAO_APLICA,
          },
        ],
      };
      //procurando algum agrupamento que o item tenha perguntas para inserir no novo agrupamento
      this.state.groupings &&
        this.state.groupings.forEach((grouping) => {
          grouping &&
            grouping.ITEMS.every((item_) => {
              if (item_?.PERGUNTAS?.length > 0) {
                const cloneQsts = item_.PERGUNTAS.map((qst) => Object.assign({}, qst));
                agrouped.ITEMS[0].PERGUNTAS = cloneQsts;

                return false;
              } else {
                return true;
              }
            });
        });
      this.setState(
        (prevState) => ({
          actionAgruped: 'editar',
          groupedSelected: agrouped,
          groupings: [...prevState.groupings, agrouped],
        }),
        async () => await handleItemsInSearch(this.state.groupings)
      );
    }
  };

  handleSaveItem = async () => {
    const { longDescriptionItem, shortDescriptionItem, groupedSelected, GGI_FLG_ORIGATORIA_NAO_APLICA } = this.state;
    const { action, actionAgruped } = this.state;
    if (actionAgruped === 'novo') {
      await this.handleSaveAgrouped();
    } else {
      let item = {};

      if (action === 'editar') {
        //verificar se está editando um item que ainda não foi salvo
        if (this.state?.idItem) {
          item = {
            GGI_ID: this.state?.idItem,
            GGI_POSICAO: this.state?.itemToEdit
              ? this.state?.itemToEdit.GGI_POSICAO
              : groupedSelected.ITEMS && groupedSelected.ITEMS.length + 1,
            GGI_DESCRICAO: shortDescriptionItem && shortDescriptionItem.toUpperCase(),
            GGI_DESCRICAO_LONGA: longDescriptionItem && longDescriptionItem.toUpperCase(),
            GGI_FLG_ORIGATORIA_NAO_APLICA: GGI_FLG_ORIGATORIA_NAO_APLICA,
          };
        } else {
          item = {
            idItemTemporary: this.state?.itemToEdit
              ? this.state?.itemToEdit.idItemTemporary
              : groupedSelected.ITEMS.length + 1,
            GGI_POSICAO: this.state?.itemToEdit ? this.state?.itemToEdit.GGI_POSICAO : groupedSelected.ITEMS.length + 1,
            GGI_DESCRICAO: shortDescriptionItem && shortDescriptionItem.toUpperCase(),
            GGI_DESCRICAO_LONGA: longDescriptionItem && longDescriptionItem.toUpperCase(),
            GGI_FLG_ORIGATORIA_NAO_APLICA: GGI_FLG_ORIGATORIA_NAO_APLICA,
          };
        }
      } else {
        item = {
          idItemTemporary: groupedSelected.ITEMS ? groupedSelected.ITEMS.length + 1 : 1,
          GGI_POSICAO: this.state?.itemToEdit
            ? this.state?.itemToEdit.GGI_POSICAO
            : groupedSelected.ITEMS
            ? groupedSelected.ITEMS.length + 1
            : 1,
          GGI_DESCRICAO: shortDescriptionItem && shortDescriptionItem.toUpperCase(),
          GGI_DESCRICAO_LONGA: longDescriptionItem && longDescriptionItem.toUpperCase(),
          GGI_FLG_ORIGATORIA_NAO_APLICA: GGI_FLG_ORIGATORIA_NAO_APLICA,
        };
      }

      if (this.state?.itemToEdit) {
        const newsItems = groupedSelected.ITEMS.filter((item) => item !== this.state?.itemToEdit);
        const itemEdited = groupedSelected.ITEMS.find((item) => item === this.state?.itemToEdit);

        if (itemEdited?.PERGUNTAS) item.PERGUNTAS = itemEdited.PERGUNTAS;
        newsItems.push(item);
        this.setState(
          (prevState) => ({
            groupedSelected: {
              ...prevState.groupedSelected,
              ITEMS: newsItems,
            },
          }),
          async () => {
            await this.setDataInGroup();
          }
        );
      } else if (item.GGI_DESCRICAO.length > 0) {
        //para adicionar um novo item
        this.state?.groupedSelected?.ITEMS &&
          this.state.groupedSelected.ITEMS.every((item_) => {
            if (item_?.PERGUNTAS?.length > 0) {
              const cloneQsts = item_.PERGUNTAS.map((qst) => Object.assign({}, qst));
              item.PERGUNTAS = cloneQsts;

              return false;
            } else {
              return true;
            }
          });

        this.setState(
          (prevState) => ({
            groupedSelected: {
              ...prevState.groupedSelected,
              ITEMS: [...prevState.groupedSelected.ITEMS, item],
            },
          }),

          async () => {
            await this.setDataInGroup();
          }
        );
      }
    }
    this.setState({
      shortDescriptionItem: '',
      longDescriptionItem: '',
      addItem: false,
      isEditItem: false,
    });
  };

  schema = Yup.object().shape({
    shortDescriptionAgruped: Yup.string().required('Campo obrigatório').max(30, 'Máximo 30 caracteres'),
    longDescriptionAgruped: Yup.string().max(100, 'Máximo 100 caracteres'),
    shortDescriptionItem: Yup.string().required('Campo obrigatório').max(30, 'Máximo 30 caracteres'),
    longDescriptionItem: Yup.string().max(100, 'Máximo 100 caracteres'),
  });

  render() {
    const {
      openModal,
      shortDescriptionAgruped,
      longDescriptionAgruped,
      shortDescriptionItem,
      longDescriptionItem,
      groupings,
      groupedSelected,
      errors,
      addItem,
      isEditItem,
      GGI_FLG_ORIGATORIA_NAO_APLICA,
      removeGrouped,
      idDelete,
      loading,
    } = this.state;

    const { handleItemsInSearch } = this.props

    return (
      <Container>
        <WaitScreen loading={loading} />
        <Linha>
          <ContentBtnAddNewAgrouped>
            <button
              // disabled={shortDescriptionAgruped.length < 1}
              className="waves-effect waves-light saib-button is-primary saib2"
              onClick={this.handleAddNewGrouped}
            >
              <Icon>add</Icon>
              Adicionar novo agrupamento
            </button>
          </ContentBtnAddNewAgrouped>
        </Linha>
        {openModal && (
          <ContentModal className="container">
            <Modal
              className="modal-item-activity"
              actions={[
                <Button
                  modal="close"
                  style={{ marginRight: '5px' }}
                  node="button"
                  waves="green"
                  disabled={
                    (errors && !!Object.values(errors).length) ||
                    (shortDescriptionItem?.length < 1 && this.state?.groupedSelected?.ITEMS?.length < 1 && true)
                  }
                  className="waves-effect waves-light saib-button is-primary saib2"
                  onClick={() => {
                    this.handleSaveAgrouped();
                  }}
                >
                  Salvar
                </Button>,
                <Button
                  modal="close"
                  node="button"
                  href="#modal1"
                  waves="green"
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() =>
                    this.setState({
                      openModal: false,
                    })
                  }
                >
                  Fechar
                </Button>,
              ]}
              bottomSheet={false}
              fixedFooter={false}
              header="Agrupamento"
              id="modal1"
              // open={this.state.openModalContact}
              open={openModal}
              options={{
                dismissible: true,
                endingTop: '10%',
                inDuration: 250,
                onCloseEnd: () => {
                  this.cleanStatesEdited();
                  this.setState({
                    openModal: false,
                  });
                },
                onCloseStart: null,
                onOpenEnd: null,
                onOpenStart: null,
                opacity: 0.5,
                outDuration: 250,
                preventScrolling: true,
                startingTop: '4%',
              }}
              root={document.body}
            >
              <ContentBodyModal>
                <Linha addRowBottom>
                  <DivDetalhe flex={2}>
                    <Labels>Descrição curta</Labels>
                    <input
                      type="text"
                      value={shortDescriptionAgruped ? capitalize(shortDescriptionAgruped, true) : ''}
                      onChange={(e) => {
                        this.setState({ shortDescriptionAgruped: e.target.value }, () =>
                          this.handleValidationUnicField('shortDescriptionAgruped', 'errors')
                        );
                      }}
                    />
                    {errors?.shortDescriptionAgruped && (
                      <span style={{ color: '#FF0000' }}>{errors.shortDescriptionAgruped}</span>
                    )}
                  </DivDetalhe>
                  <DivDetalhe flex={4}>
                    <Labels>Descrição longa</Labels>
                    <input
                      type="text"
                      value={longDescriptionAgruped ? capitalize(longDescriptionAgruped, true) : ''}
                      onChange={(e) => {
                        this.setState(
                          {
                            longDescriptionAgruped: e.target.value,
                          },
                          () => this.handleValidationUnicField('longDescriptionAgruped', 'errors')
                        );
                      }}
                    />
                    {errors?.longDescriptionAgruped && (
                      <span style={{ color: '#FF0000' }}>{errors.longDescriptionAgruped}</span>
                    )}
                  </DivDetalhe>
                </Linha>

                <ContentItemsInModal>
                  <LinhaTitleItensAgrupamento>
                    <Labels>Itens do agrupamento</Labels>
                    <button
                      disabled={(errors && !!Object.values(errors).length) || shortDescriptionAgruped?.length < 1}
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={this.handleAddNewItemInGruped}
                    >
                      <Icon>add</Icon>
                    </button>
                  </LinhaTitleItensAgrupamento>
                  {this.state.actionAgruped === 'editar' &&
                    groupedSelected.ITEMS &&
                    groupedSelected.ITEMS.sort((a, b) => {
                      return a.GGI_ID - b.GGI_ID;
                    }).map((item, i) => (
                      <EachItemModal key={i}>
                        {item.GGI_DESCRICAO && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <p>{item.GGI_DESCRICAO}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <IconContainer
                                onClick={() => {
                                  this.handleEditAgruped(groupedSelected);
                                  this.handleEditItemAgruped(item);
                                }}
                              >
                                <Icon>edit</Icon>
                              </IconContainer>
                            </div>
                          </div>
                        )}
                      </EachItemModal>
                    ))}
                  {isEditItem || addItem ? (
                    <ContentInputs>
                      <DivDetalhe maxWidth flex={2}>
                        <Labels>Descrição curta</Labels>
                        <input
                          type="text"
                          value={shortDescriptionItem ? capitalize(shortDescriptionItem, true) : ''}
                          onChange={async (e) => {
                            this.setState(
                              {
                                shortDescriptionItem: e.target.value,
                              },
                              () => this.handleValidationUnicField('shortDescriptionItem', 'errors')
                            );
                          }}
                        />
                        {errors?.shortDescriptionItem && (
                          <span style={{ color: '#FF0000' }}>{errors.shortDescriptionItem}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe maxWidth flex={4}>
                        <Labels>Descrição longa</Labels>
                        <input
                          type="text"
                          value={longDescriptionItem ? capitalize(longDescriptionItem, true) : ''}
                          onChange={async (e) => {
                            this.setState(
                              {
                                longDescriptionItem: e.target.value,
                              },
                              () => this.handleValidationUnicField('longDescriptionItem', 'errors')
                            );
                          }}
                        />
                        {errors?.longDescriptionItem && (
                          <span style={{ color: '#FF0000' }}>{errors.longDescriptionItem}</span>
                        )}
                      </DivDetalhe>
                      <DivDetalhe flex={1}>
                        <Checkbox
                          id={'Checkbox_obrigatoriedade'}
                          label="Obrigatoriedade não se aplica"
                          value={GGI_FLG_ORIGATORIA_NAO_APLICA}
                          checked={GGI_FLG_ORIGATORIA_NAO_APLICA}
                          onChange={() => {
                            this.setState({
                              GGI_FLG_ORIGATORIA_NAO_APLICA: GGI_FLG_ORIGATORIA_NAO_APLICA === 0 ? 1 : 0,
                            });
                          }}
                        />
                      </DivDetalhe>
                      <DivDetalhe maxWidth flex={1}>
                        <button
                          disabled={(errors && !!Object.values(errors).length) || shortDescriptionItem?.length < 1}
                          className="waves-effect waves-light saib-button is-primary"
                          onClick={this.handleSaveItem}
                        >
                          <Icon>save</Icon> Salvar
                        </button>
                      </DivDetalhe>
                    </ContentInputs>
                  ) : (
                    ''
                  )}
                </ContentItemsInModal>
              </ContentBodyModal>
            </Modal>
          </ContentModal>
        )}

        <ContentAgroupeds>
          {groupings &&
            groupings
              .sort((a, b) => {
                return a.GGR_ID - b.GGR_ID;
              })
              .map((item, i) => (
                <ContentAgrouped key={i}>
                  <ContentDescriptionAgrouped>
                    <p>{item.GGR_DESCRICAO}</p>
                  </ContentDescriptionAgrouped>

                  <DivDetalhe style={{ gap: '0.2rem' }}>
                    <button
                      // disabled={item?.GGI_ID && true}
                      className="waves-effect waves-light saib-button is-primary saib2"
                      onClick={async () => {
                        this.handleEditAgruped(item);
                      }}
                    >
                      <Icon>edit</Icon>
                      Editar
                    </button>
                    {item.GGR_ID && (
                      <button
                        className="waves-effect waves-light saib-button is-primary saib2"
                        onClick={() => {
                          this.setState({ removeGrouped: true, idDelete: item.GGR_ID });
                        }}
                      >
                        <Icon>delete</Icon>
                        Excluir
                      </button>
                    )}

                    {!item.GGR_ID && (
                      <button
                        className="waves-effect waves-light saib-button is-primary saib2"
                        onClick={async () => {
                          const updateArray = groupings.filter(e => e !== item)
                          await handleItemsInSearch(updateArray)
                          this.setState({ groupings: updateArray })
                        }}
                      >
                        <Icon>delete</Icon>
                        Excluir
                      </button>
                    )}

                    {removeGrouped && (
                      <Modal
                        actions={[
                          <>
                            <Button
                              className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                              onClick={() => this.handleDeleteGrouping(idDelete)}
                              color="primary"
                            >
                              Sim
                            </Button>
                            <Button
                              className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                              onClick={() => {
                                this.setState({ removeGrouped: false });
                              }}
                              color="primary"
                            >
                              Não
                            </Button>
                          </>,
                        ]}
                        bottomSheet={false}
                        fixedFooter={false}
                        header={'Excluir agrupamento'}
                        options={{
                          dismissible: true,
                          endingTop: '10%',
                          inDuration: 0,
                          onCloseStart: null,
                          onOpenEnd: null,
                          opacity: 0.5,
                          outDuration: 0,
                          preventScrolling: true,
                          startingTop: '4%',
                          onCloseEnd: () => {
                            this.setState({
                              removeGrouped: false,
                            });
                          },
                        }}
                        open={removeGrouped}
                      >
                        <div
                          style={{
                            overflowY: 'unset',
                            overflowX: 'hidden',
                            height: 'unset',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '16px',
                          }}
                        >
                          Tem certeza que deseja excluir esse agrupamento?
                        </div>
                      </Modal>
                    )}
                  </DivDetalhe>
                </ContentAgrouped>
              ))}
        </ContentAgroupeds>
      </Container>
    );
  }
}
