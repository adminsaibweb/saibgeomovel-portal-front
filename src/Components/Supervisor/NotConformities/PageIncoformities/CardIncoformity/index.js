import React, { Component } from 'react';
import { Checkbox, Icon } from 'react-materialize';
import { capitalize } from '../../../../../services/funcoes';
import { Container, Title, ContentIncoformity, FooterCard, ContentLabels } from './styled';
import { Link } from 'react-router-dom';

export default class CardIncormity extends Component {
  state ={
    indexPage: undefined,
    dataInconformities: undefined,
    idsSelected: undefined,
  }
  render() {
    const {
      data,
      indexPage,
      onChangeSelectIncoformities,
      idsSelected,
      addIdSelected,
      handleSaveIncoformities,
      disableBtns,
      handleDoSave,
    } = this.props;

    return (
      <Container>
        <ContentLabels>
          <p className="pClient">
            Cliente
            <Checkbox
              id={'check' + String(data.ID)}
              label=""
              onChange={onChangeSelectIncoformities}
              checked={idsSelected.includes(String(data.ID))}
              value={String(data.ID)}
            />
          </p>

          <Title withLimiterLabel bold>
            {capitalize(data.NOME_FANTASIA, true)}
          </Title>
        </ContentLabels>
        <ContentLabels>
          <p>Rota</p>
          <Title withLimiterLabel bold>
            {data.ID_NCFM_ESTR} - {capitalize(data.ESTR_DESCR_ROTA, true)}
          </Title>
        </ContentLabels>

        <ContentIncoformity>
          <p>Motivo não compra</p>
          <Title bold>{capitalize(data.DESCRICAO, true)}</Title>
          <br />
          <p>Tipo não conformidade</p>
          <Title bold color="#000" contrast>
            {capitalize(data.DESCR_NCFM, true)}
          </Title>
        </ContentIncoformity>

        <FooterCard>
          {!disableBtns && (
            <>
              <Link
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '35px',
                  top: '4px',
                  position: 'relative',
                  width: '100%',
                }}
                className="saib-button is-secondary "
                to={{
                  pathname: '/PopUpNotConformitie',
                  state: {
                    indexPage: indexPage,
                    dataInconformities: data,
                    idsSelected: idsSelected,
                    handleDoSave: handleDoSave,
                  },
                }}
              >
                <Icon>check</Icon>
                Aprovar
              </Link>
              <button
                type="submit"
                className="saib-button is-secondary "
                onClick={async () => {
                  await addIdSelected(data.ID);
                  handleSaveIncoformities(false);
                }}
              >
                <Icon>do_not_disturb_alt</Icon>
                Negar
              </button>
            </>
          )}
        </FooterCard>
      </Container>
    );
  }
}
