

function MyReactComponent(props){
    const {useState, useEffect,useRef, lazy, Suspense} = React;
    const [data, setData] = useState([]);
    const [coinSelect, setCoinSelect] = useState([]);
    const [dashboard, setDashboard] = useState([]);
    const [coin_details, setCoinDetails] = useState([]);
    const [cart, setCart] = useState({});
    const [loaded_item_num, setLoadedItemNum] = useState(4);
    let api_string='https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=';
    const qtyRef = useRef([]);
    const sync = ()=>{
        get_data();
        console.log('synced')
    }
    const get_coin_details = ()=>{
        if (data.length> 0) {
            for (let i = 0; i < data.length; i++) {
                    
                if (i === (data.length -1)) {
                    api_string = `${api_string}${data[i].id}`;
                } else {
                    api_string = `${api_string}${data[i].id},`;
                }
            }
            fetch(api_string,{
                method:'GET', headers: {'Accepts': 'application/json','X-CMC_PRO_API_KEY': '63be7f99-4796-49a3-8628-0f722749d66b', origin: 'https://mehedii-hasann.github.io'}
              })
            .then(response => response.json())
            .then(response =>{
                setCoinDetails([response.data])
            })
        }
    }
    const add_to_dashboard = (e)=>{
        
        if(dashboard.length ==0)
        {
            let temp = data.filter(p => p.id == e.target.value);
            temp[0].qty = 0;
            setDashboard(temp);
        }
        else{
            if( dashboard.length != data.length ){
                data.map((p)=>{
                    let duplicate = false;
                    if (p.id == e.target.value) {
                        dashboard.map(dash=>{
                            if (dash.id == p.id) {
                                duplicate = true;
                            }
                        })
                        if (!duplicate) {
                            let temp = p;
                            temp.qty = 0;
                            return setDashboard(dashboard=>[...dashboard,temp]);
                        }
                    }
                })
            }
        }
        
    }
    const delete_dashboard = (id)=>{
        setDashboard(dashboard.filter(p => p.id !== id))
    }
    const search = (e)=>{
        setCoinSelect(data.filter(p => ((p.name).toLowerCase()).includes(e.target.value)));
    }
    const handle_product = (event,product_id)=>{
        const e = event.target;
        for (let i = 0; i < dashboard.length; i++) {
            if (dashboard[i].id == product_id) {
                let newDashboard = [...dashboard];
                if (e.name === 'qty' && e.value != 0) {
                    newDashboard[i].qty = e.value;
                    newDashboard[i].price = newDashboard[i].quote.USD.price;
                    setDashboard(newDashboard);
                }
            }
        }
    }
    const refresh_product = (id,index)=>{
        let new_products = [...dashboard];
        new_products.map(p=>{
            if (p.id==id) {
                p.qty = 0;
            }
        });
        setDashboard(new_products);
        qtyRef.current[index].value = 0;
    }
    const calculate_cart = ()=>{
       let cart_obj = {
            len:dashboard.length,
            total:0,
        }
        for (let i = 0; i < dashboard.length; i++) {
            if (dashboard[i].qty) {
                cart_obj.total += (dashboard[i].qty * dashboard[i].quote.USD.price);
            }
        }
        cart_obj.total = cart_obj.total.toFixed(4);
        setCart(cart_obj);
    }
    const sync_dashboard = ()=>{
        if (dashboard.length> 0) {
            data.map(d=>{
                dashboard.map((item,index)=>{
                    if(item.id == d.id){
                        let temp = [...dashboard];
                        temp[index].quote.USD.price = d.quote.USD.price;
                        setDashboard(temp);
                    }
                })
            })
        }

    }
    useEffect(() => {
        sync_dashboard();
        get_coin_details();
    }, [data])
    
    useEffect(() => {
      calculate_cart();
    }, [dashboard]);
    const get_data = ()=>{
        fetch("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",{
            method:'GET', headers: {'Accepts': 'application/json','X-CMC_PRO_API_KEY': '63be7f99-4796-49a3-8628-0f722749d66b'}
          })
        .then(response => response.json())
        .then(response =>setData(response.data));

    }
    useEffect(() => {
        get_data();
    }, []);
    const load_more = ()=>{
        setLoadedItemNum(prev=>prev+4);
    }
    console.log(coin_details);
    return(
        <div>
            <main class="m-5 p-5">
                <div class="">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="scan-panel br">
                                <div class="form-group row">
                                    <div class="col-sm-12">
                                            <input type="text" onChange={(event)=>search(event)} class="form-control" autocomplete="on" placeholder='Search here'/>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <div class="col-sm-12">
                                            { coinSelect.length>0  && coinSelect.length!== data.length? 
                                                <select  class="rounded p-1" onChange={event => add_to_dashboard(event)} >
                                                    <option>Select Crypto</option>
                                                    {coinSelect.map((p)=>{
                                                        return <option value ={p.id} class='form-control'>{p.name} </option>
                                                    })}
                                                </select>
                                                : ''}
                                        
                                    </div>
                                </div>
                            </div>
                            <div class="item-panel table-responsive br bg-light rounded">
                                <table class="table table-borderless p-3">
                                    <thead>
                                        <tr>
                                            <th>Delete</th>
                                            <th>Name</th>
                                            <th class="item-price">Price</th>
                                            <th class="item-quantity">Quantity</th>
                                            <th>Total</th>
                                            <th>Reset</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            (dashboard.length > 0) ?
                                                dashboard.map((p,index)=>{
                                                    if (p.id !== 0) {
                                                        return <tr id={p.id} class='products'>
                                                                <td><a class="text-danger remove-product" onClick={()=>delete_dashboard(p.id)}><i class="fas fa-minus-circle"></i></a></td>
                                                                <td>{p.name}</td>
                                                                <td>
                                                                    {(p.quote.USD.price).toFixed(4)}
                                                                </td>
                                                                <td><input type="number" ref={e=>qtyRef.current[index]=e} product_id={p.id} product_name={p.name} min="1" step="1" class="form-control" name="qty" onChange={event=>handle_product(event,p.id)}/></td>
                                                                {(p.quote.USD.price && p.qty ) ? <td>{((p.quote.USD.price) * p.qty).toFixed(4)} USD</td> : <td>0 USD</td>}
                                                                <td><a class="text-info pl-2" onClick={()=>refresh_product(p.id,index)}><i class="fas fa-sync"></i></a></td>
                                                            </tr>
                                                    }
                                                }) : <tr><td>No item</td></tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="col-md-4 right-panel br bg-secondary rounded p-3">
                            <div class="footer text-right">
                                <div class="float-start" >
                                    <button type="button" class="btn btn-success" onClick={()=>sync()}>Sync</button>
                                </div>
                            </div>
                            {dashboard.length>0 ? dashboard.map((coin,index)=>{
                                return <div class="row mb-1 text-end font-weight-bold">
                                            <div class="col text-start">{ coin_details[0][coin.id] ? <img class='mr-2' src={coin_details[0][coin.id].logo} height='30px' width='30px' /> : ''}{coin.symbol} x {coin.qty ? coin.qty : 0}</div>
                                            <div class="col text-end">{(coin.quote.USD.price * (coin.qty ? coin.qty : 0)).toFixed(4)} USD</div>
                                        </div>
                            }): ""}
                            {cart.len ? <> 
                            <hr/>
                            <div class="row mb-1 text-end font-weight-bold">
                                <div class="col text-start">Cart Quantity </div>
                                <div class="col text-end">{cart.len}</div>
                            </div>
                            <div class="row mb-1 text-end font-weight-bold">
                                <div class="col text-start">Total</div>
                                <div class="col text-end">{cart.total} USD</div>
                            </div></>
                                : ""}
                        </div>
                    </div>
                    <div class='row ml-1'>
                        <div className="element-container">
                            {coin_details.length>0 ?  data.map((coin,index) => (
                                (coin.id === coin_details[0][coin.id].id && (index <loaded_item_num)) ?  
                                    <div key={coin.id} className="element-item">
                                        <div class='row m-2'>
                                            <div class='col-sm-4 text-right'>
                                                <img class='mr-2' src={coin_details[0][coin.id].logo} height='40px' width='40px' />
                                            </div>
                                            <div class='col-sm-8 text-left '>
                                                <h4>{coin_details[0][coin.id].name}</h4>
                                                <h5>$ {(coin.quote.USD.price).toFixed(4)} </h5>
                                            </div>
                                        </div>
                                        <hr/>
                                        <div class='row'>
                                            <p class='text-justify pl-4 pr-4'>
                                                {coin_details[0][coin.id].description  ? coin_details[0][coin.id].description : 'Description not available'}
                                            </p>
                                        </div>
                                    </div> : ''
                                )) : <><h4 className='text-info'>Fetching Market Data..</h4></>}
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <div class="text-center col">
                            {coin_details.length>0 ? <button type="button" className="btn btn-outline-info btn-sm" onClick={()=>load_more()}>Load More</button> : ''}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
if (document.getElementById('user')) {
    ReactDOM.render(<MyReactComponent  />, document.getElementById('user'));
}
