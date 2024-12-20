import React, { Component } from 'react';
import { Checkbox, Icon } from 'react-materialize';
import { Labels } from '../../../../Pages/Supervisor/NotConformities/styled';
import CardIncormity from './CardIncoformity';
import { Container, Linha, LinhaCards } from './styled';

export default class PageIncoformities extends Component {
  state = {
    dataIncoformitites: [],
    idsSelected: [],
    checkAll: false,
    disableButtonsCard: false,
    handleDoSave: undefined,
  };

  componentDidMount() {
    // console.log('this.props', this.props);
    this.handleDataIncoformities();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.indexPage !== this.props.indexPage) {
      this.handleDataIncoformities();
    }
    if (prevProps.data !== this.props.data) {
      this.handleDataIncoformities();
    }
    if (prevProps.clearSelecteds !== this.props.clearSelecteds && this.props.clearSelecteds) {
      this.setState({
        idsSelected: [],
      });
    }
    if (prevState.idsSelected !== this.state.idsSelected) {
    }
  }

  handleDataIncoformities = () => {
    const { data, indexPage } = this.props;

    const dataIncoformitites = data.filter((data_) => data_.index === indexPage);
    if (data.length <= 40) {
      this.setState({
        dataIncoformitites: data,
      });
    } else {
      this.setState({
        dataIncoformitites,
      });
    }
  };

  onChangeSelectIncoformities = (ev) => {
    const { value, checked } = ev.target;
    const { idsSelected, checkAll, dataIncoformitites } = this.state;

    if (checked) {
      if (this.state.idsSelected.concat(ev.target.value).length === dataIncoformitites.length) {
        this.setState({
          checkAll: true,
        });
      }

      if (this.state.idsSelected.concat(ev.target.value).length > 1) {
        this.setState({
          disableButtonsCard: true,
        });
      }

      this.setState((prevState) => ({
        idsSelected: [...prevState.idsSelected, ev.target.value],
      }));
    } else {
      const newsIds = idsSelected.filter((id) => id !== value);

      if (this.state.idsSelected.length === 2) {
        this.setState({
          disableButtonsCard: false,
        });
      }
      this.setState({
        checkAll: checkAll ? false : checkAll,
        idsSelected: newsIds,
      });
    }
  };

  handleAddIdSelected = async (id) => {
    const { idsSelected } = this.state;
    idsSelected.length === 0 &&
      this.setState((prevState) => ({
        idsSelected: [...prevState.idsSelected, id],
      }));
  };

  render() {
    const { dataIncoformitites, checkAll, idsSelected, disableButtonsCard, indexPage } = this.state;

    return (
      <Container>
        <Linha>
          {dataIncoformitites.length > 0 && (
            <Checkbox
              className="checkAll"
              id={'Checkbox'}
              label="Selecionar todos"
              onChange={(ev) =>
                this.setState({
                  checkAll: ev.target.checked,
                  disableButtonsCard: ev.target.checked ? true : false,
                  idsSelected: ev.target.checked ? dataIncoformitites.map((data) => String(data.ID)) : [],
                })
              }
              checked={checkAll}
              value={'labl'}
            />
          )}

          {idsSelected.length > 0 && <Labels className="labelCounter">{`${idsSelected.length} selecionado(s)`}</Labels>}
        </Linha>

        <Linha>
          {idsSelected.length > 1 && (
            <div className="contentButtons">
              <button
                type="submit"
                className="saib-button is-secondary "
                onClick={async () => {
                  this.props.handleSaveIncoformities(this.state.idsSelected, true);
                }}
              >
                <Icon>check</Icon>
                Aprovar
              </button>
              <button
                type="submit"
                className="saib-button is-secondary "
                onClick={async () => {
                  this.props.handleSaveIncoformities(this.state.idsSelected, false);
                }}
              >
                <Icon>do_not_disturb_alt</Icon>
                Negar
              </button>
            </div>
          )}
        </Linha>
        <LinhaCards>
          {dataIncoformitites.map((data, i) => (
            <div key={i} className="contentCard">
              <CardIncormity
                data={data}
                disableBtns={disableButtonsCard}
                indexPage={indexPage}
                idsSelected={this.state.idsSelected}
                onChangeSelectIncoformities={this.onChangeSelectIncoformities}
                addIdSelected={this.handleAddIdSelected}
                // handleDoSave={this.handleDoSave}
                handleSaveIncoformities={
                  (aproval) => this.props.handleSaveIncoformities(this.state.idsSelected, aproval)
                  // .then(() => this.setState({ idsSelected: [] }))
                }
              />
            </div>
          ))}
        </LinhaCards>
      </Container>
    );
  }
}
