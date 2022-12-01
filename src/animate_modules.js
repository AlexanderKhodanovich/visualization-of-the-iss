class Animation {
    constructor(pos, img) {
        this.root_modules = [18, 24, 25, 30];
        this.positions = pos;
        this.images = img;
        this.duration = 500;
        
        // initialized on each call of animate()
        this.promise = null
        this.resolve = null;
        this.mod_ids = null;
        this.scalar = null;
        this.reverse = false;
        this.ends = [];
        this.n_active_ends = 0;
        this.moves = null;
        
        // pushed to on each call of animate()
        this.queue = [];
        this.history_queue = [];
        this.promises = [];
    }
    
    get_leaves(mod_id, ends = []) {
        if (this.positions[mod_id].children.length == 0)
            ends.push(mod_id);
        else {
            this.positions[mod_id].children.forEach(ch => {
                ends = this.get_leaves(ch, ends);
            });
        }
        return ends;
    }

    move(mv, step_done) {
        var [x, y] = move_in_3d((+this.images[mv.id].select("image").attr("x")),
                                  (+this.images[mv.id].select("image").attr("y")),
                                  mv.v);

        this.images[mv.id].select("image")
            .datum([this, step_done])
            .transition()
            .duration(this.duration)
            .ease(d3.easeExp)
            .attr("x", x)
            .attr("y", y)
            .on("end", function(args) {
                // if the current end module initiated the move
                if (args[0].ends.includes(mv.id) && mv.root == true)
                    args[0].n_active_ends--;  // then this was its last move
                
                // resolve the step promise
                args[1](args[0]);
            
                // if no more active ends left
                if (args[0].n_active_ends == 0) {
                    args[0].promises.shift();
                    args[0].resolve(args[0]) // resolve
                }
            });
    }
    
    apply_moves(i=0) {
        var step_done;
        var promise_step = new Promise(resolve => {
            step_done = resolve;
        });
        
        this.moves[i].forEach(mv => {
            this.move(mv, step_done);
        });
        
        promise_step.then(function(context) {
            console.log("step done", i);
            if (context.moves.length > ++i)
                context.apply_moves(i);
        });
    }
    
    construct_moves() {
        const positions = this.positions;
        
        function get_all_children(id, res) {
            positions[id].children.forEach(ch => {
                res.add(ch);
                res = get_all_children(ch, res);
            });
            return res;
        }
        
        function get_all_parents(id, res) {
            res.add(positions[id].parent);
            if (positions[id].parent != -1)
                res = get_all_parents(positions[id].parent, res);
            return res;
        }
        
        function construct(positions, ids, scalar, reverse=false, moves=[]) {
            if (reverse == false)
                var mult = 1;
            else
                var mult = -1;
            
            for (var i = 0, done = false; !done; ++i) {
                done = true;
                var moves_one_step = [];
                ids.forEach(id => {
                    // if the current move is not the last, there is something more to do
                    if (i < positions[id].moves.length - 1)
                        done = false;
                    
                    var mv = positions[id].moves[i];
                    if (mv != null) {
                        if (mv.direction == "-x") {
                            var v = [-mv.d*scalar*mult, 0, 0];
                        } else if (mv.direction == "+x") {
                            var v = [mv.d*scalar*mult, 0, 0];
                        } else if (mv.direction == "-y") {
                            var v = [0, -mv.d*scalar*mult, 0];
                        } else if (mv.direction == "+y") {
                            var v = [0, mv.d*scalar*mult, 0];
                        } else if (mv.direction == "-z") {
                            var v = [0, 0, -mv.d*scalar*mult];
                        } else if (mv.direction == "+z") {
                            var v = [0, 0, mv.d*scalar*mult];
                        }
                        var mods = get_all_children(id, new Set());
                        if (reverse == false)
                            moves_one_step.push({id:id, v:v, root:true});
                        mods.forEach(m => {
                            // append moves of the children
                            moves_one_step.push({id:m, v:v, root:false});  
                        })
                        if (reverse == true)
                            moves_one_step.push({id:id, v:v, root:true});
                    }
                });
                moves.push(moves_one_step);
            }
            
            var c = [];
            ids.forEach(id => {
                c = c.concat(positions[id].children);
            });
            
            if (c.length != 0)
                moves = construct(positions, c, scalar, reverse, moves);
            
            return moves;
        }

        if (this.reverse == true)
            return construct(this.positions, this.ends, this.scalar, this.reverse).reverse();
        else
            return construct(this.positions, this.mod_ids, this.scalar, this.reverse);
    }
    
    animate_ready() {
        var data = this.queue.shift();
        this.reverse = data.reverse;
        
        if (this.reverse == true) {
            var h_data = this.history_queue.shift();
            
            // init parameters
            this.promise = data.promise;
            this.resolve = data.resolver;
            this.mod_ids = h_data.ends;
            this.scalar = h_data.scalar;
            
            // init ends as roots
            this.ends = h_data.roots;
            this.n_active_ends = this.ends.length;
        } else {
            // init parameters
            this.promise = data.promise;
            this.resolve = data.resolver;
            this.mod_ids = data.mod_ids;
            this.scalar = data.scalar;
            
            // init ends as leaves (with no children)
            this.mod_ids.forEach(mid => { this.ends = this.ends.concat(this.get_leaves(mid)); });
            this.n_active_ends = this.ends.length;
            
            // push to history_queue
            this.history_queue.push({
                id: data.id,
                roots: data.mod_ids,
                ends: this.ends,
                scalar: data.scalar
            });
        }
        
        // construct moves
        this.moves = this.construct_moves();
        
        // apply moves
        this.apply_moves();
    }
    
    animate_helper(mod_ids, scalar, reverse) {
        this.mod_ids = mod_ids
        
        // create the animation promise and a function to resolve it
        var done;
        var animate_promise = new Promise(resolve => {
            done = resolve;
        });
        
        // get all other promises
        var other_promises = Promise.all(this.promises);
        
        // add animation to the queue
        this.promises.push(animate_promise);
        this.queue.push({
            id: this.history_queue.length,
            resolver: done,
            mod_ids: mod_ids,
            scalar: scalar,
            reverse: reverse
        });
        
        // if no animations in queue
        if (this.promises.length == 1) {
            console.log("Started animation");

            // animate
            this.animate_ready();
        }
        // otherwise
        else {
            // wait for previous animations
            other_promises.then(function(context) {
                // animate
                console.log("Started animation"); 
                context[0].animate_ready(); 
            });
        }
        
        // wait for animation to finish
        animate_promise.then(function(context) {
            context.ends = [];
            console.log("finished animation"); 
        });
    }
    
    animate_reverse() {
        this.animate_helper(null, null, true);
    }
    
    animate(mod_ids, scalar) {
        this.animate_helper(mod_ids, scalar, false);
    }
    
    
    
    animate_all(scalar) {
        this.animate_helper(this.root_modules, scalar, false);
    }
}