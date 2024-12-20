import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 80px;
  /* margin-bottom: 10px; */

  max-height: 10%;
  height: 100px;
  /* height: 6rem; */

  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);

  button.update {
    height: 3rem;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
  width: ${(props) => props.width && props.width};
  /* padding-top: 0; */
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-align: left;
  /* line-height: 0.9rem; */
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
    width: 100%;
  }

  select {
    display: block !important;
  }
  select.selectTypeEmployee {
    border-radius: 5px;
  }
  .searchButton {
    padding: 18px !important;
    color: white;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  /* padding: 10px; */
  display: flex;
  align-items: stretch;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
`;

export const ContentButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: ${(props) => (props.isMobile ? '100%' : 'unset')};
`;

export const ContentTable = styled.div`
  table.findSchedule {
    thead tr th,
    tbody tr td {
      padding: 5px 10px !important;
    }
  }
`;
