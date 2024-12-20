import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - 10px);
  align-self: center;
  padding: 10px 0;
  /* height: 55%; */
  /* min-height: 200px; */
  margin-top: 10px;
  margin-bottom: 10px;
  /* height: 100%; */
  /* max-height: 106rem; */
  /* height: 22rem; */
  flex-direction: column;
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);

  div.skeletonLoading {
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    padding: 5px;
    border-radius: 10px;
    width: 100%;
    /* height: 100%; */
    margin: 2px;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 10px; */
  text-align: left;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  position: sticky;
  top: 0;
  background: #fff;
  /* line-height: 0.9rem; */
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  select {
    display: block !important;
  }
  select.selectTypeEmployee {
    border-radius: 5px;
  }

  table {
    /* height: 100%; */

    thead tr {
      position: sticky;
      top: 0;
      background-color: #fff;
      min-height: 200px;
    }
    tbody tr {
      min-height: 150px;

      line-height: 2.5rem;
      color: #000;
      font-weight: 500;
      /* height: 2em; */
      td {
        /* height: 2.5em; */

        .mapButton {
          padding: 12px !important;
        }
        .photoButton,
        .scheduleButton {
          height: 28px;
        }
      }

      td.td-iconAlert {
        display: flex;
        align-items: center;
        i {
          color: #bd207b;
        }
      }
    }
  }
  .filterBoxScreen {
    display: flex;
    flex-direction: column;
    position: absolute;
    background: white;
    box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);
    border-radius: 10px;
    border: 1px solid #ccc;
    padding: 2px;
    align-items: flex-end;
    input {
      width: 94%;
      margin-right: 5px;
      line-height: 10px;
      height: 32px;
    }
    span {
      padding: 0px 10px;
      margin: 5px 0px;
    }

    .topLineFilterBox {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0px !important;
      margin: 0px !important;
      width: 25px;
      span {
        width: 20px;
      }
    }

    .bottomLineFilterBox {
      display: flex;
      justify-content: space-around;
      flex-direction: row;
      width: 100%;
    }
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const Td = styled.td`
  flex: ${(props) => (props.flex ? props.flex : '1')};
  /* width: ${(props) => props.buttonsIndicator && '14rem'}; */
  display: ${(props) => props.buttonsIndicator && 'flex'};
  justify-content: ${(props) => props.buttonsIndicator && 'space-between'};
`;
export const Th = styled.th`
  padding: 15px 0 !important;
  flex: ${(props) => (props.flex ? props.flex : '1')};

  width: ${(props) => props.buttonsIndicator && '14rem'};
`;
export const Tr = styled.tr`
  background-color: ${(props) => (props.clicked ? '#8e44ad29' : 'unset')};
`;

export const DivFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  i {
    margin-right: 5px;
    cursor: pointer;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  margin: 5px;
  display: flex;
  align-items: stretch;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
`;

export const ContentData = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  ul.collapsible {
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 5px !important;

    div.collapsible-header {
      background: none !important;
      font-weight: 500;
      font-size: 1rem;
      padding: 0px 0px !important;
      color: #858585 !important;

      i {
        /* color: #bd207b !important; */
      }
    }
  }
`;

export const EachLine = styled.div``;

export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
`;

export const ContentItemsBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px;
  background: ${(props) => (props.clicked ? 'rgba(196, 196, 196, 0.22) !important' : 'none')};
`;

export const PTitle = styled.p`
  font-weight: 500;
  max-width: ${(props) => props.width};
  width: ${(props) => props.width};
`;

export const PDescriptionItem = styled.p`
  font-weight: 500;
  font-size: 0.9rem;
  max-width: ${(props) => props.width};
  width: ${(props) => props.width};

  display: flex;
`;

export const ContentNamesCompany = styled.div`
  display: flex;
  flex-direction: column;

  max-width: ${(props) => props.width};
  width: ${(props) => props.width};
`;

export const CorporateName = styled.label`
  font-size: 0.7rem;
`;
