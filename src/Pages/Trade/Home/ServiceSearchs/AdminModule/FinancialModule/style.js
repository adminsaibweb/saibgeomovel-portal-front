import styled from 'styled-components';

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 0px 10px 0px 10px; */
  text-align: left;
  width: 100%;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  @media (max-width: 768px) {
    /* padding-top: 0px; */
    button {
      width: 100%;
    }
  }
  div > .input-field.col {
    margin-top: 0px !important;
  }
  select {
    display: block !important;
  }
  button {
    margin: 2px;
    /* margin-bottom: 10px !important; */
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const FinancialButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 45%;
  padding: 10px;
  font-size: 18px;
  color: ${(props) => props.typeFilter ? '#fff' : '#000'};
  background: ${(props) => props.typeFilter ? '#8E44AD' : '#fff'};
  gap: 5px;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.40);
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 2px 2px, rgba(0, 0, 0, 0.12) 0px 0px 3px, rgba(0, 0, 0, 0.12) 0px 2px 2px, rgba(0, 0, 0, 0.17) 0px 4px 3px, rgba(0, 0, 0, 0.09) 0px 0px 2px;
  transition: all 0.2s linear;

  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

export const BillContainer = styled.div`
  width: 650px;
  @media (max-width: 650px) {
    width: 100%;
  }
`;
