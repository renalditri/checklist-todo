import React, { useState, useEffect } from 'react';
import './App.css';

const base_url = 'http://94.74.86.174:8080/api/';

function App() {
  const [login, setLogin] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('bearer_token')) {
      return;
    }
    setLogin(localStorage.getItem('bearer_token'))
  }, [])

  useEffect(() => {
    if (login) {
      fetch(base_url + 'checklist', {
        method: 'get',
        headers: {
          'Authorization': 'Bearer ' + login
        }
      })
        .then(res => res.json())
        .then(res => {
          setChecklists(res.data);
          console.log(res);
        })
    }
  }, [login, refresh])

  return (
    <div className="App p-3">
      <header>
        <h1>Checklist App</h1>
      </header>
      <main>
        {(!login) ? <Login /> : <ChecklistPage />}
      </main>
    </div>
  );

  function Login() {
    const [loginInfo, setLoginInfo] = useState({ username: '', password: '' }),
      [registerInfo, setRegisterInfo] = useState({ email: '', username: '', password: '' }),
      loginUser = () => {
        if (loginInfo.username == '' || loginInfo.password == '') {
          alert('Data anda tidak lengkap')
        } else {
          fetch(base_url + 'login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginInfo)
          })
            .then(res => res.json())
            .then(res => {
              if (res.statusCode == 400 || res.statusCode == 401) {
                alert(res.errorMessage)
              } else {
                alert('Login berhasil');
                localStorage.setItem('bearer_token', res.data.token);
                setLogin(localStorage.getItem('bearer_token'));
              }
              console.log(res);
            })
        }
      },
      registerUser = () => {
        if (registerInfo.email == '' || registerInfo.username == '' || registerInfo.password == '') {
          alert('Data anda tidak lengkap')
        } else {
          fetch(base_url + 'register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerInfo)
          })
            .then(res => res.json())
            .then(res => {
              if (res.statusCode == 400 || res.statusCode == 401) {
                alert(res.errorMessage)
              } else {
                alert('Register berhasil, mohon login dengan info akun anda')
              }
              console.log(res);
            })
        }
      },
      handleChangeLogin = (value, type) => {
        setLoginInfo({
          username: (type == 'username') ? value : loginInfo.username,
          password: (type == 'password') ? value : loginInfo.password
        })
      },
      handleChangeRegister = (value, type) => {
        setRegisterInfo({
          email: (type == 'email') ? value : registerInfo.email,
          username: (type == 'username') ? value : registerInfo.username,
          password: (type == 'password') ? value : registerInfo.password
        })
      };

    return (
      <div>
        <section>
          <h3>Login</h3>
          <input
            onChange={(e) => handleChangeLogin(e.target.value, 'username')}
            type={'text'}
            placeholder="username"
            value={loginInfo.username}
          />
          <input
            onChange={(e) => handleChangeLogin(e.target.value, 'password')}
            type={'text'}
            placeholder="password"
            value={loginInfo.password}
          />
          <button onClick={loginUser}>login</button>
        </section>
        <section>
          <h3>Register</h3>
          <input
            type={'text'}
            placeholder="email"
            onChange={(e) => handleChangeRegister(e.target.value, 'email')}
          />
          <input
            type={'text'}
            placeholder="username"
            onChange={(e) => handleChangeRegister(e.target.value, 'username')}
          />
          <input
            type={'text'}
            placeholder="password"
            onChange={(e) => handleChangeRegister(e.target.value, 'password')}
          />
          <button onClick={registerUser}>register</button>
        </section>
      </div>
    )
  }

  function ChecklistPage() {
    const [title, setTitle] = useState(''),
      clickHandler = () => {
        if (title != '') {
          fetch(base_url + 'checklist', {
            method: 'post',
            headers: {
              'Authorization': 'Bearer ' + login,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: title })
          })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setRefresh(!refresh);
          })
        }
      };
    return (
      <section className='checklist'>
        <h3>Checklists</h3>
        <input
          onChange={(e) => setTitle(e.target.value)}
          type={'text'}
          placeholder="Checklist Title"
          value={title}
        />
        <button onClick={clickHandler}>Add Checklist</button>
        <div className='Row'>
          <Checklist />
        </div>
      </section>
    )
  }

  function Checklist() {
    const [newItem, setNewItem] = useState(''),
      clickHandler = (id) => {
        if (newItem == '') {
          alert('Tidak bisa kosong');
          return;
        }
        fetch(base_url + 'checklist/' + id + '/item', {
          method: 'post',
          headers: {
            'Authorization': 'Bearer ' + login,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName: newItem })
        })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setRefresh(!refresh);
          })
      },
      handleChange = (checklistId, itemId) => {
        fetch(base_url + 'checklist/' + checklistId + '/item/' + itemId, {
          method: 'put',
          headers: {
            'Authorization': 'Bearer ' + login,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName: newItem })
        })
          .then(res => res.json())
          .then(res => {
            console.log(res)
          })
      },
      handleDelete = (checklistId) => {
        fetch(base_url + 'checklist/' + checklistId, {
          method: 'delete',
          headers: {
            'Authorization': 'Bearer ' + login,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName: newItem })
        })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setRefresh(!refresh);
          })
      },
      handleDeleteItem = (checklistId, itemId) => {
        fetch(base_url + 'checklist/' + checklistId + '/item/' + itemId, {
          method: 'delete',
          headers: {
            'Authorization': 'Bearer ' + login,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName: newItem })
        })
          .then(res => res.json())
          .then(res => {
            console.log(res);
            setRefresh(!refresh);
          })
      };
    return checklists.map(checklist => {
      return (
        <section className='card col-6 offset-3'>
          <div className='card-body'>
            <h4 className='card-title d-inline'>{checklist.name}  </h4>
            <button
              className='btn btn-danger p-1'
              onClick={() => handleDelete(checklist.id)}
            >
              <i class="bi bi-trash-fill"></i>
            </button>
            <div className='row'>
              {(checklist.items) ? checklist.items.map(item => {
                return (
                  <div className='col-12 my-3'>
                    <input
                      type={'checkbox'}
                      defaultChecked={item.itemCompletionStatus}
                      onChange={() => handleChange(checklist.id, item.id)}
                    />
                    <span>{item.name}</span>
                    <button
                      className='btn btn-danger p-1'
                      onClick={() => handleDeleteItem(checklist.id, item.id)}
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                )
              }) : ''
              }
            </div>
            <input
              onChange={(e) => setNewItem(e.target.value)}
              type={'text'}
              placeholder="Checklist Item"
            />
            <button onClick={() => clickHandler(checklist.id)}>Add Item</button>
          </div>
        </section >
      )
    })
  }
}

export default App;
