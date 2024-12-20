import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  /* min-width: calc(100vw - 75px); */
  display: flex;
  /* justify-content: space-between; */
  height: 100vh;
  width: ${(props) => (props.isMobile ? '100%' : 'calc(100% - 67px)')};
  min-height: 100vh;
  background-color: #f1f1f11c;
  margin-left: 64px;
  align-items: center;
  align-items: flex-start;
  .hideMobile {
    div {
      width: 99%;
    }
  }

  .hideDesktop {
    display: none;
  }

  @media (max-width: 768px) {
    margin-left: 0px;
    margin-top: 50px;
    .hideMobile {
      display: none;
    }
    .hideDesktop {
      display: flex;
      flex-direction: column;
    }
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
      height: 2em;
      td {
        height: 2.5em;

        .mapButton {
          padding: 12px !important;
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

export const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
`;
