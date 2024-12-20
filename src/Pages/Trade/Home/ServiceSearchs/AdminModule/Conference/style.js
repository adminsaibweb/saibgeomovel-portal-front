import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center !important;
  justify-content: space-between;

  background-color: #fff;
  align-items: flex-start;
  width: 100%;
  height: 92vh;

  .btn-conference {
    background: #ba3f83;
    border: 1px solid #ba3f83;
    border-radius: 100px;
    color: #ffffff;
    cursor: pointer;
    display: inline-block;
    font-family: 'Roboto';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    padding: 6px 12px;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    text-transform: unset !important;
  }

  .btn-conference:hover {
    background: #ba3f83 !important;
  }

  @media (max-width: 768px) {
    margin-left: 0px;
    padding-top: 50px;
  }
`;

export const ContainerCollapsibleAndBtns = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ContentCollapsible = styled.div`
  width: 100%;
  .collapsible-header {
    background-color: ${(props) => (props.diff ? '#ed3241' : '#8e44ad')};
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    align-items: center;
    gap: 0.2rem;
    border-radius: 5px;
  }
`;

export const CardChoiceProduct = styled.div`
  display: flex;
  flex-direction: column;

  margin-bottom: 0.5rem;

  width: 100%;
  border-radius: 4px;
  border: 1px solid #d5b5e3;
  padding: 0.3rem 0.5rem;
`;
