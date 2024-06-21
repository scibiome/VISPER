import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import NavigationBar from "../NavigationBar/NavigationBar";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgba(240, 240, 240, 0.5);
`;

const FormContainer = styled.div` // Changed from styled.form to styled.div
  text-align: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
`;

/**
 * Login page for admins to upload a file afterwards
 * @returns 
 */
const LoginForm = () => {
  const history = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  /**
   * check login credentials and get back cookie
   * @param {*} values 
   */
  const onFinish = (values) => {
    setLoading(true);
    axios.post("http://localhost:8000/login/", values)
      .then((response) => {
        console.log("35", response.data, response.data.cookie);
        setLoading(false);
        const cookie_num = response.data.cookie;
        if (cookie_num) {
          history('/Upload', { state: { cookie_num } });
        }
      })
      .catch((error) => {
        setLoading(false);
        const errorMsg = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Login failed. Please check your credentials and try again.';
        setErrorMessage(errorMsg);
      });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <img
        src="background3.jpg"
        alt="Background"
        className="image-background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: -20,
          left: 0,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <NavigationBar />
        <Container>
          <FormContainer>
            <p>Login to add further data to the database</p>
            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 12 }}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username!' }]}
              >
                <Input style={{ width: '200px', height: '30px' }} />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password style={{ width: '200px', height: '30px' }} />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
                <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#001529' }}>
                  Log In
                </Button>
              </Form.Item>
              {errorMessage && (
                <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                  {errorMessage}
                </div>
              )}

            </Form>
          </FormContainer>
        </Container>
      </div>
    </div>
  );
};

export default LoginForm;
