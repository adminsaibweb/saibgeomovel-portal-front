import styled from 'styled-components';

export const MenuItem = styled.div`
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  width: 100%;
  justify-content: start;
  border-top: 2px solid #D9D9D9;
  color: #8E44AD;
  padding: 20px 10px;
  gap: 10px;
`;

export const Titulo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  background-color: #8e44ad;
  color: white;
  width: 100%;
  text-align: center;
  height: 50px;
  z-index: 1;
  @media (max-width: 768px) {
    height: 50px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;