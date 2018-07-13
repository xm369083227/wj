PrimeFaces.widget.DataTable = PrimeFaces.widget.DeferredWidget
		.extend({
			SORT_ORDER : {
				ASCENDING : 1,
				DESCENDING : -1,
				UNSORTED : 0
			},
			init : function(a) {
				this._super(a);
				this.thead = this.getThead();
				this.tbody = this.getTbody();
				if (this.cfg.paginator) {
					this.bindPaginator()
				}
				this.bindSortEvents();
				if (this.cfg.selectionMode) {
					this.setupSelection()
				}
				if (this.cfg.filter) {
					this.setupFiltering()
				}
				if (this.cfg.expansion) {
					this.expansionProcess = [];
					this.bindExpansionEvents()
				}
				if (this.cfg.editable) {
					this.bindEditEvents()
				}
				if (this.cfg.draggableRows) {
					this.makeRowsDraggable()
				}
				this.renderDeferred()
			},
			_render : function() {
				if (this.cfg.scrollable) {
					this.setupScrolling()
				}
				if (this.cfg.resizableColumns) {
					this.setupResizableColumns()
				}
				if (this.cfg.draggableColumns) {
					this.setupDraggableColumns()
				}
				if (this.cfg.stickyHeader) {
					this.setupStickyHeader()
				}
			},
			getThead : function() {
				return $(this.jqId + "_head")
			},
			getTbody : function() {
				return $(this.jqId + "_data")
			},
			updateData : function(c, a) {
				var b = (a === undefined) ? true : a;
				if (b) {
					this.tbody.html(c)
				} else {
					this.tbody.append(c)
				}
				this.postUpdateData()
			},
			postUpdateData : function() {
				if (this.cfg.draggableRows) {
					this.makeRowsDraggable()
				}
			},
			refresh : function(a) {
				this.columnWidthsFixed = false;
				this.init(a)
			},
			bindPaginator : function() {
				var a = this;
				this.cfg.paginator.paginate = function(b) {
					a.paginate(b)
				};
				this.paginator = new PrimeFaces.widget.Paginator(
						this.cfg.paginator)
			},
			bindSortEvents : function() {
				var d = this;
				this.sortableColumns = this.thead
						.find("> tr > th.ui-sortable-column");
				this.sortableColumns.attr("tabindex", "0");
				if (this.cfg.multiSort) {
					this.sortMeta = []
				}
				for (var a = 0; a < this.sortableColumns.length; a++) {
					var c = this.sortableColumns.eq(a), e = c
							.children("span.ui-sortable-column-icon"), b = null;
					if (c.hasClass("ui-state-active")) {
						if (e.hasClass("ui-icon-triangle-1-n")) {
							b = this.SORT_ORDER.ASCENDING
						} else {
							b = this.SORT_ORDER.DESCENDING
						}
						if (d.cfg.multiSort) {
							d.addSortMeta({
								col : c.attr("id"),
								order : b
							})
						}
					} else {
						b = this.SORT_ORDER.UNSORTED
					}
					c.data("sortorder", b)
				}
				this.sortableColumns
						.on("mouseenter.dataTable", function() {
							var f = $(this);
							if (!f.hasClass("ui-state-active")) {
								f.addClass("ui-state-hover")
							}
						})
						.on("mouseleave.dataTable", function() {
							var f = $(this);
							if (!f.hasClass("ui-state-active")) {
								f.removeClass("ui-state-hover")
							}
						})
						.on("blur.dataTable", function() {
							$(this).removeClass("ui-state-focus")
						})
						.on("focus.dataTable", function() {
							$(this).addClass("ui-state-focus")
						})
						.on(
								"keydown.dataTable",
								function(h) {
									var f = h.which, g = $.ui.keyCode;
									if ((f === g.ENTER || f === g.NUMPAD_ENTER)
											&& $(h.target).is(":not(:input)")) {
										$(this).trigger("click.dataTable",
												(h.metaKey || h.ctrlKey));
										h.preventDefault()
									}
								})
						.on(
								"click.dataTable",
								function(j, h) {
									if (!d.shouldSort(j, this)) {
										return
									}
									PrimeFaces.clearSelection();
									var i = $(this), f = i.data("sortorder"), g = (f === d.SORT_ORDER.UNSORTED) ? d.SORT_ORDER.ASCENDING
											: -1 * f, k = j.metaKey
											|| j.ctrlKey || h;
									if (d.cfg.multiSort) {
										if (k) {
											d.addSortMeta({
												col : i.attr("id"),
												order : g
											});
											d.sort(i, g, true)
										} else {
											d.sortMeta = [];
											d.addSortMeta({
												col : i.attr("id"),
												order : g
											});
											d.sort(i, g)
										}
									} else {
										d.sort(i, g)
									}
								})
			},
			shouldSort : function(b, a) {
				if (this.isEmpty()) {
					return false
				}
				var c = $(b.target);
				if (c.closest(".ui-column-customfilter", a).length) {
					return false
				}
				return c.is("th,span")
			},
			addSortMeta : function(a) {
				this.sortMeta = $.grep(this.sortMeta, function(b) {
					return b.col !== a.col
				});
				this.sortMeta.push(a)
			},
			setupFiltering : function() {
				var b = this, a = this.thead.find("> tr > th.ui-filter-column");
				this.cfg.filterEvent = this.cfg.filterEvent || "keyup";
				this.cfg.filterDelay = this.cfg.filterDelay || 300;
				a.children(".ui-column-filter").each(function() {
					var c = $(this);
					if (c.is("input:text")) {
						PrimeFaces.skinInput(c);
						b.bindTextFilter(c)
					} else {
						PrimeFaces.skinSelect(c);
						b.bindChangeFilter(c)
					}
				})
			},
			bindTextFilter : function(a) {
				if (this.cfg.filterEvent === "enter") {
					this.bindEnterKeyFilter(a)
				} else {
					this.bindFilterEvent(a)
				}
			},
			bindChangeFilter : function(a) {
				var b = this;
				a.change(function() {
					b.filter()
				})
			},
			bindEnterKeyFilter : function(a) {
				var b = this;
				a.bind("keydown", function(f) {
					var c = f.which, d = $.ui.keyCode;
					if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
						f.preventDefault()
					}
				}).bind("keyup", function(f) {
					var c = f.which, d = $.ui.keyCode;
					if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
						b.filter();
						f.preventDefault()
					}
				})
			},
			bindFilterEvent : function(a) {
				var b = this;
				a.on("keydown.dataTable-blockenter", function(f) {
					var c = f.which, d = $.ui.keyCode;
					if ((c === d.ENTER || c === d.NUMPAD_ENTER)) {
						f.preventDefault()
					}
				}).on(this.cfg.filterEvent + ".dataTable", function(c) {
					if (b.filterTimeout) {
						clearTimeout(b.filterTimeout)
					}
					b.filterTimeout = setTimeout(function() {
						b.filter();
						b.filterTimeout = null
					}, b.cfg.filterDelay)
				})
			},
			setupSelection : function() {
				this.selectionHolder = this.jqId + "_selection";
				this.cfg.rowSelectMode = this.cfg.rowSelectMode || "new";
				this.rowSelector = "> tr.ui-widget-content.ui-datatable-selectable";
				this.cfg.disabledTextSelection = this.cfg.disabledTextSelection === false ? false
						: true;
				var a = $(this.selectionHolder).val();
				this.selection = (a === "") ? [] : a.split(",");
				this.originRowIndex = 0;
				this.cursorIndex = null;
				this.bindSelectionEvents()
			},
			bindSelectionEvents : function() {
				if (this.cfg.selectionMode === "radio") {
					this.bindRadioEvents()
				} else {
					if (this.cfg.selectionMode === "checkbox") {
						this.bindCheckboxEvents();
						this.updateHeaderCheckbox();
						if (this.cfg.rowSelectMode !== "checkbox") {
							this.bindRowEvents()
						}
					} else {
						this.bindRowEvents()
					}
				}
			},
			bindRowEvents : function() {
				var a = this;
				this.bindRowHover();
				this.tbody.off("click.dataTable", this.rowSelector).on(
						"click.dataTable", this.rowSelector, null, function(b) {
							a.onRowClick(b, this)
						});
				if (this.hasBehavior("rowDblselect")) {
					this.tbody.off("dblclick.dataTable", this.rowSelector).on(
							"dblclick.dataTable", this.rowSelector, null,
							function(b) {
								a.onRowDblclick(b, $(this))
							})
				}
			},
			bindRowHover : function() {
				this.tbody.off("mouseenter.dataTable mouseleave.dataTable",
						this.rowSelector).on("mouseenter.dataTable",
						this.rowSelector, null, function() {
							var a = $(this);
							if (!a.hasClass("ui-state-highlight")) {
								a.addClass("ui-state-hover")
							}
						}).on("mouseleave.dataTable", this.rowSelector, null,
						function() {
							var a = $(this);
							if (!a.hasClass("ui-state-highlight")) {
								a.removeClass("ui-state-hover")
							}
						})
			},
			bindRadioEvents : function() {
				var c = this, b = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column :radio";
				if (this.cfg.nativeElements) {
					this.tbody.off("click.dataTable", b).on("click.dataTable",
							b, null, function(f) {
								var d = $(this);
								if (!d.prop("checked")) {
									c.selectRowWithRadio(d)
								}
							})
				} else {
					var a = "> tr.ui-widget-content:not(.ui-datatable-empty-message) > td.ui-selection-column .ui-radiobutton .ui-radiobutton-box";
					this.tbody
							.off(
									"click.dataTable mouseover.dataTable mouseout.dataTable",
									a)
							.on(
									"mouseover.dataTable",
									a,
									null,
									function() {
										var d = $(this);
										if (!d.hasClass("ui-state-disabled")
												&& !d
														.hasClass("ui-state-active")) {
											d.addClass("ui-state-hover")
										}
									})
							.on("mouseout.dataTable", a, null, function() {
								var d = $(this);
								d.removeClass("ui-state-hover")
							})
							.on(
									"click.dataTable",
									a,
									null,
									function() {
										var d = $(this), f = d
												.hasClass("ui-state-active"), e = d
												.hasClass("ui-state-disabled");
										if (!e && !f) {
											c.selectRowWithRadio(d)
										}
									})
				}
				this.tbody
						.off("focus.dataTable blur.dataTable change.dataTable",
								b)
						.on("focus.dataTable", b, null, function() {
							var d = $(this), e = d.parent().next();
							if (d.prop("checked")) {
								e.removeClass("ui-state-active")
							}
							e.addClass("ui-state-focus")
						})
						.on("blur.dataTable", b, null, function() {
							var d = $(this), e = d.parent().next();
							if (d.prop("checked")) {
								e.addClass("ui-state-active")
							}
							e.removeClass("ui-state-focus")
						})
						.on(
								"change.dataTable",
								b,
								null,
								function() {
									var d = c.tbody.find(b).filter(":checked"), e = d
											.parent().next();
									c.selectRowWithRadio(e)
								})
			},
			bindCheckboxEvents : function() {
				var b = this, c = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column :checkbox";
				if (this.cfg.nativeElements) {
					this.checkAllToggler = this.thead
							.find("> tr > th.ui-selection-column > :checkbox");
					this.checkAllToggler.on("click", function() {
						b.toggleCheckAll()
					});
					this.tbody.off("click.dataTable", c).on("click.dataTable",
							c, null, function(f) {
								var d = $(this);
								if (d.prop("checked")) {
									b.selectRowWithCheckbox(d)
								} else {
									b.unselectRowWithCheckbox(d)
								}
							})
				} else {
					this.checkAllToggler = this.thead
							.find("> tr > th.ui-selection-column > .ui-chkbox.ui-chkbox-all > .ui-chkbox-box");
					this.checkAllToggler.on(
							"mouseover",
							function() {
								var d = $(this);
								if (!d.hasClass("ui-state-disabled")
										&& !d.hasClass("ui-state-active")) {
									d.addClass("ui-state-hover")
								}
							}).on("mouseout", function() {
						$(this).removeClass("ui-state-hover")
					}).on("click", function() {
						var d = $(this);
						if (!d.hasClass("ui-state-disabled")) {
							b.toggleCheckAll()
						}
					});
					var a = "> tr.ui-widget-content.ui-datatable-selectable > td.ui-selection-column .ui-chkbox .ui-chkbox-box";
					this.tbody
							.off(
									"mouseover.dataTable mouseover.dataTable click.dataTable",
									a).on("mouseover.dataTable", a, null,
									function() {
										var d = $(this);
										if (!d.hasClass("ui-state-active")) {
											d.addClass("ui-state-hover")
										}
									}).on("mouseout.dataTable", a, null,
									function() {
										$(this).removeClass("ui-state-hover")
									}).on(
									"click.dataTable",
									a,
									null,
									function() {
										var e = $(this), d = e
												.hasClass("ui-state-active");
										if (d) {
											b.unselectRowWithCheckbox(e)
										} else {
											b.selectRowWithCheckbox(e)
										}
									})
				}
				this.tbody
						.off(
								"focus.dataTable blur.dataTable keydown.dataTable keyup.dataTable",
								c).on("focus.dataTable", c, null, function() {
							var d = $(this), e = d.parent().next();
							if (d.prop("checked")) {
								e.removeClass("ui-state-active")
							}
							e.addClass("ui-state-focus")
						}).on("blur.dataTable", c, null, function() {
							var d = $(this), e = d.parent().next();
							if (d.prop("checked")) {
								e.addClass("ui-state-active")
							}
							e.removeClass("ui-state-focus")
						}).on("keydown.dataTable", c, null, function(f) {
							var d = $.ui.keyCode;
							if (f.which === d.SPACE) {
								f.preventDefault()
							}
						}).on("keyup.dataTable", c, null, function(h) {
							var g = $.ui.keyCode;
							if (h.which === g.SPACE) {
								var d = $(this), f = d.parent().next();
								if (d.prop("checked")) {
									b.unselectRowWithCheckbox(f)
								} else {
									b.selectRowWithCheckbox(f)
								}
								h.preventDefault()
							}
						})
			},
			bindExpansionEvents : function() {
				var b = this, a = "> tr > td > div.ui-row-toggler";
				this.tbody.off("click.datatable-expansion", a).on(
						"click.datatable-expansion", a, null, function() {
							b.toggleExpansion($(this))
						})
			},
			setupScrolling : function() {
				this.scrollHeader = this.jq
						.children(".ui-datatable-scrollable-header");
				this.scrollBody = this.jq
						.children(".ui-datatable-scrollable-body");
				this.scrollFooter = this.jq
						.children(".ui-datatable-scrollable-footer");
				this.scrollStateHolder = $(this.jqId + "_scrollState");
				this.scrollHeaderBox = this.scrollHeader
						.children("div.ui-datatable-scrollable-header-box");
				this.scrollFooterBox = this.scrollFooter
						.children("div.ui-datatable-scrollable-footer-box");
				this.headerTable = this.scrollHeaderBox.children("table");
				this.bodyTable = this.scrollBody.children("table");
				this.footerTable = this.scrollFooter.children("table");
				this.footerCols = this.scrollFooter
						.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
				this.percentageScrollHeight = this.cfg.scrollHeight
						&& (this.cfg.scrollHeight.indexOf("%") !== -1);
				this.percentageScrollWidth = this.cfg.scrollWidth
						&& (this.cfg.scrollWidth.indexOf("%") !== -1);
				var c = this, b = this.getScrollbarWidth() + "px";
				if (this.cfg.scrollHeight) {
					if (this.percentageScrollHeight) {
						this.adjustScrollHeight()
					}
					if (this.hasVerticalOverflow()) {
						this.scrollHeaderBox.css("margin-right", b);
						this.scrollFooterBox.css("margin-right", b)
					}
				}
				this.fixColumnWidths();
				if (this.cfg.scrollWidth) {
					if (this.percentageScrollWidth) {
						this.adjustScrollWidth()
					} else {
						this.setScrollWidth(parseInt(this.cfg.scrollWidth))
					}
				}
				this.cloneHead();
				this.restoreScrollState();
				if (this.cfg.liveScroll) {
					this.scrollOffset = this.cfg.scrollStep;
					this.shouldLiveScroll = true
				}
				this.scrollBody
						.on(
								"scroll.dataTable",
								function() {
									var g = c.scrollBody.scrollLeft();
									c.scrollHeaderBox.css("margin-left", -g);
									c.scrollFooterBox.css("margin-left", -g);
									if (c.shouldLiveScroll) {
										var f = this.scrollTop, e = this.scrollHeight, d = this.clientHeight;
										if (f >= (e - (d))) {
											c.loadLiveRows()
										}
									}
									c.saveScrollState()
								});
				this.scrollHeader.on("scroll.dataTable", function() {
					c.scrollHeader.scrollLeft(0)
				});
				this.scrollFooter.on("scroll.dataTable", function() {
					c.scrollFooter.scrollLeft(0)
				});
				var a = "resize." + this.id;
				$(window).unbind(a).bind(a, function() {
					if (c.jq.is(":visible")) {
						if (c.percentageScrollHeight) {
							c.adjustScrollHeight()
						}
						if (c.percentageScrollWidth) {
							c.adjustScrollWidth()
						}
					}
				})
			},
			cloneHead : function() {
				this.theadClone = this.thead.clone();
				this.theadClone.find("th").each(function() {
					var a = $(this);
					a.attr("id", a.attr("id") + "_clone");
					$(this).children().not(".ui-column-title").remove()
				});
				this.theadClone.removeAttr("id").addClass(
						"ui-datatable-scrollable-theadclone").height(0)
						.prependTo(this.bodyTable)
			},
			adjustScrollHeight : function() {
				var d = this.jq.parent().innerHeight()
						* (parseInt(this.cfg.scrollHeight) / 100), f = this.jq
						.children(".ui-datatable-header").outerHeight(true), b = this.jq
						.children(".ui-datatable-footer").outerHeight(true), c = (this.scrollHeader
						.outerHeight(true) + this.scrollFooter
						.outerHeight(true)), e = this.paginator ? this.paginator
						.getContainerHeight(true)
						: 0, a = (d - (c + e + f + b));
				this.scrollBody.height(a)
			},
			adjustScrollWidth : function() {
				var a = parseInt((this.jq.parent().innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
				this.setScrollWidth(a)
			},
			setOuterWidth : function(a, b) {
				var c = a.outerWidth() - a.width();
				a.width(b - c)
			},
			setScrollWidth : function(a) {
				var b = this;
				this.jq.children(".ui-widget-header").each(function() {
					b.setOuterWidth($(this), a)
				});
				this.scrollHeader.width(a);
				this.scrollBody.css("margin-right", 0).width(a);
				this.scrollFooter.width(a)
			},
			alignScrollBody : function() {
				var a = this.hasVerticalOverflow() ? this.getScrollbarWidth()
						+ "px" : "0px";
				this.scrollHeaderBox.css("margin-right", a);
				this.scrollFooterBox.css("margin-right", a)
			},
			getScrollbarWidth : function() {
				if (!this.scrollbarWidth) {
					this.scrollbarWidth = $.browser.webkit ? "15" : PrimeFaces
							.calculateScrollbarWidth()
				}
				return this.scrollbarWidth
			},
			hasVerticalOverflow : function() {
				return (this.cfg.scrollHeight && this.bodyTable.outerHeight() > this.scrollBody
						.outerHeight())
			},
			restoreScrollState : function() {
				var a = this.scrollStateHolder.val(), b = a.split(",");
				this.scrollBody.scrollLeft(b[0]);
				this.scrollBody.scrollTop(b[1])
			},
			saveScrollState : function() {
				var a = this.scrollBody.scrollLeft() + ","
						+ this.scrollBody.scrollTop();
				this.scrollStateHolder.val(a)
			},
			clearScrollState : function() {
				this.scrollStateHolder.val("0,0")
			},
			fixColumnWidths : function() {
				var a = this;
				if (!this.columnWidthsFixed) {
					if (PrimeFaces.isIE(7)) {
						this.bodyTable.css("width", "auto")
					}
					if (this.cfg.scrollable) {
						this.scrollHeader
								.find(
										"> .ui-datatable-scrollable-header-box > table > thead > tr > th")
								.each(
										function() {
											var e = $(this), b = e.index(), c = e
													.width();
											e.width(c);
											if (a.footerCols.length > 0) {
												var d = a.footerCols.eq(b);
												d.width(c)
											}
										})
					} else {
						this.jq
								.find(
										"> .ui-datatable-tablewrapper > table > thead > tr > th")
								.each(function() {
									var b = $(this);
									b.width(b.width())
								})
					}
					this.columnWidthsFixed = true
				}
			},
			loadLiveRows : function() {
				if (this.liveScrollActive) {
					return
				}
				this.liveScrollActive = true;
				var b = this, a = {
					source : this.id,
					process : this.id,
					update : this.id,
					formId : this.cfg.formId,
					params : [ {
						name : this.id + "_scrolling",
						value : true
					}, {
						name : this.id + "_skipChildren",
						value : true
					}, {
						name : this.id + "_scrollOffset",
						value : this.scrollOffset
					}, {
						name : this.id + "_encodeFeature",
						value : true
					} ],
					onsuccess : function(e, c, d) {
						PrimeFaces.ajax.Response
								.handle(
										e,
										c,
										d,
										{
											widget : b,
											handle : function(f) {
												this.updateData(f, false);
												this.scrollOffset += this.cfg.scrollStep;
												if (this.scrollOffset === this.cfg.scrollLimit) {
													this.shouldLiveScroll = false
												}
												this.liveScrollActive = false
											}
										});
						return true
					}
				};
				PrimeFaces.ajax.Request.handle(a)
			},
			paginate : function(d) {
				var c = this, b = {
					source : this.id,
					update : this.id,
					process : this.id,
					formId : this.cfg.formId,
					params : [ {
						name : this.id + "_pagination",
						value : true
					}, {
						name : this.id + "_first",
						value : d.first
					}, {
						name : this.id + "_rows",
						value : d.rows
					}, {
						name : this.id + "_encodeFeature",
						value : true
					} ],
					onsuccess : function(g, e, f) {
						PrimeFaces.ajax.Response.handle(g, e, f, {
							widget : c,
							handle : function(h) {
								this.updateData(h);
								if (this.checkAllToggler) {
									this.updateHeaderCheckbox()
								}
								if (this.cfg.scrollable) {
									this.alignScrollBody()
								}
							}
						});
						return true
					},
					oncomplete : function() {
						c.paginator.cfg.page = d.page;
						c.paginator.updateUI()
					}
				};
				if (this.hasBehavior("page")) {
					var a = this.cfg.behaviors.page;
					a.call(this, b)
				} else {
					PrimeFaces.ajax.Request.handle(b)
				}
			},
			sort : function(d, a, f) {
				var e = this, b = {
					source : this.id,
					update : this.id,
					process : this.id,
					params : [ {
						name : this.id + "_sorting",
						value : true
					}, {
						name : this.id + "_skipChildren",
						value : true
					}, {
						name : this.id + "_encodeFeature",
						value : true
					} ],
					onsuccess : function(i, g, h) {
						PrimeFaces.ajax.Response
								.handle(
										i,
										g,
										h,
										{
											widget : e,
											handle : function(j) {
												this.updateData(j);
												var l = e.getPaginator();
												if (l) {
													l.setPage(0, true)
												}
												if (!f) {
													this.sortableColumns
															.filter(
																	".ui-state-active")
															.data(
																	"sortorder",
																	this.SORT_ORDER.UNSORTED)
															.removeClass(
																	"ui-state-active")
															.find(
																	".ui-sortable-column-icon")
															.removeClass(
																	"ui-icon-triangle-1-n ui-icon-triangle-1-s")
												}
												d
														.data("sortorder", a)
														.removeClass(
																"ui-state-hover")
														.addClass(
																"ui-state-active");
												var k = d
														.find(".ui-sortable-column-icon");
												if (a === this.SORT_ORDER.DESCENDING) {
													k
															.removeClass(
																	"ui-icon-triangle-1-n")
															.addClass(
																	"ui-icon-triangle-1-s")
												} else {
													if (a === this.SORT_ORDER.ASCENDING) {
														k
																.removeClass(
																		"ui-icon-triangle-1-s")
																.addClass(
																		"ui-icon-triangle-1-n")
													}
												}
											}
										});
						return true
					},
					oncomplete : function(i, g, h) {
						var j = e.getPaginator();
						if (j && h && j.cfg.rowCount !== h.totalRecords) {
							j.setTotalRecords(h.totalRecords)
						}
					}
				};
				if (f) {
					b.params.push({
						name : this.id + "_multiSorting",
						value : true
					});
					b.params.push({
						name : this.id + "_sortKey",
						value : e.joinSortMetaOption("col")
					});
					b.params.push({
						name : this.id + "_sortDir",
						value : e.joinSortMetaOption("order")
					})
				} else {
					b.params.push({
						name : this.id + "_sortKey",
						value : d.attr("id")
					});
					b.params.push({
						name : this.id + "_sortDir",
						value : a
					})
				}
				if (this.hasBehavior("sort")) {
					var c = this.cfg.behaviors.sort;
					c.call(this, b)
				} else {
					PrimeFaces.ajax.Request.handle(b)
				}
			},
			joinSortMetaOption : function(b) {
				var c = "";
				for (var a = 0; a < this.sortMeta.length; a++) {
					c += this.sortMeta[a][b];
					if (a !== (this.sortMeta.length - 1)) {
						c += ","
					}
				}
				return c
			},
			filter : function() {
				var c = this, a = {
					source : this.id,
					update : this.id,
					process : this.id,
					formId : this.cfg.formId,
					params : [ {
						name : this.id + "_filtering",
						value : true
					}, {
						name : this.id + "_encodeFeature",
						value : true
					} ],
					onsuccess : function(f, d, e) {
						PrimeFaces.ajax.Response.handle(f, d, e, {
							widget : c,
							handle : function(g) {
								this.updateData(g);
								if (this.cfg.scrollable) {
									this.alignScrollBody()
								}
								if (this.isCheckboxSelectionEnabled()) {
									this.updateHeaderCheckbox()
								}
							}
						});
						return true
					},
					oncomplete : function(f, d, e) {
						var g = c.getPaginator();
						if (g) {
							g.setTotalRecords(e.totalRecords)
						}
					}
				};
				if (this.hasBehavior("filter")) {
					var b = this.cfg.behaviors.filter;
					b.call(this, a)
				} else {
					PrimeFaces.ajax.AjaxRequest(a)
				}
			},
			onRowClick : function(e, d, a) {
				if ($(e.target).is("td,span:not(.ui-c)")) {
					var g = $(d), c = g.hasClass("ui-state-highlight"), f = e.metaKey
							|| e.ctrlKey, b = e.shiftKey;
					if (c && f) {
						this.unselectRow(g, a)
					} else {
						if (this.isSingleSelection()
								|| (this.isMultipleSelection() && e && !f && !b && this.cfg.rowSelectMode === "new")) {
							this.unselectAllRows()
						}
						if (this.isMultipleSelection() && e && e.shiftKey) {
							this.selectRowsInRange(g)
						} else {
							this.originRowIndex = g.index();
							this.cursorIndex = null;
							this.selectRow(g, a)
						}
					}
					if (this.cfg.disabledTextSelection) {
						PrimeFaces.clearSelection()
					}
				}
			},
			onRowDblclick : function(a, c) {
				if (this.cfg.disabledTextSelection) {
					PrimeFaces.clearSelection()
				}
				if ($(a.target).is("td,span:not(.ui-c)")) {
					var b = this.getRowMeta(c);
					this.fireRowSelectEvent(b.key, "rowDblselect")
				}
			},
			onRowRightClick : function(c, b, f) {
				if ($(c.target).is("td,span:not(.ui-c)")) {
					var e = $(b), d = this.getRowMeta(e), a = e
							.hasClass("ui-state-highlight");
					if (f === "single" || !a) {
						this.unselectAllRows()
					}
					this.selectRow(e, true);
					this.fireRowSelectEvent(d.key, "contextMenu");
					if (this.cfg.disabledTextSelection) {
						PrimeFaces.clearSelection()
					}
				}
			},
			findRow : function(a) {
				var b = a;
				if (PrimeFaces.isNumber(a)) {
					b = this.tbody.children("tr:eq(" + a + ")")
				}
				return b
			},
			selectRowsInRange : function(f) {
				var c = this.tbody.children(), e = this.getRowMeta(f), d = this;
				if (this.cursorIndex !== null) {
					var g = this.cursorIndex, a = g > this.originRowIndex ? c
							.slice(this.originRowIndex, g + 1) : c.slice(g,
							this.originRowIndex + 1);
					a.each(function(h, j) {
						d.unselectRow($(j), true)
					})
				}
				this.cursorIndex = f.index();
				var b = this.cursorIndex > this.originRowIndex ? c.slice(
						this.originRowIndex, this.cursorIndex + 1) : c.slice(
						this.cursorIndex, this.originRowIndex + 1);
				b.each(function(h, j) {
					d.selectRow($(j), true)
				});
				this.fireRowSelectEvent(e.key, "rowSelect")
			},
			selectRow : function(b, a) {
				var d = this.findRow(b), c = this.getRowMeta(d);
				this.highlightRow(d);
				if (this.isCheckboxSelectionEnabled()) {
					if (this.cfg.nativeElements) {
						d.children("td.ui-selection-column").find(":checkbox")
								.prop("checked", true)
					} else {
						this.selectCheckbox(d
								.children("td.ui-selection-column").find(
										"> div.ui-chkbox > div.ui-chkbox-box"))
					}
					this.updateHeaderCheckbox()
				}
				this.addSelection(c.key);
				this.writeSelections();
				if (!a) {
					this.fireRowSelectEvent(c.key, "rowSelect")
				}
			},
			unselectRow : function(b, a) {
				var d = this.findRow(b), c = this.getRowMeta(d);
				this.unhighlightRow(d);
				if (this.isCheckboxSelectionEnabled()) {
					if (this.cfg.nativeElements) {
						d.children("td.ui-selection-column").find(":checkbox")
								.prop("checked", false)
					} else {
						this.unselectCheckbox(d.children(
								"td.ui-selection-column").find(
								"> div.ui-chkbox > div.ui-chkbox-box"))
					}
					this.updateHeaderCheckbox()
				}
				this.removeSelection(c.key);
				this.writeSelections();
				if (!a) {
					this.fireRowUnselectEvent(c.key, "rowUnselect")
				}
			},
			highlightRow : function(a) {
				a.removeClass("ui-state-hover").addClass("ui-state-highlight")
						.attr("aria-selected", true)
			},
			unhighlightRow : function(a) {
				a.removeClass("ui-state-highlight")
						.attr("aria-selected", false)
			},
			fireRowSelectEvent : function(d, a) {
				if (this.cfg.behaviors) {
					var c = this.cfg.behaviors[a];
					if (c) {
						var b = {
							params : [ {
								name : this.id + "_instantSelectedRowKey",
								value : d
							} ]
						};
						c.call(this, b)
					}
				}
			},
			fireRowUnselectEvent : function(d, b) {
				if (this.cfg.behaviors) {
					var a = this.cfg.behaviors[b];
					if (a) {
						var c = {
							params : [ {
								name : this.id + "_instantUnselectedRowKey",
								value : d
							} ]
						};
						a.call(this, c)
					}
				}
			},
			selectRowWithRadio : function(a) {
				var c = a.closest("tr"), b = this.getRowMeta(c);
				this.unselectAllRows();
				if (!this.cfg.nativeElements) {
					this.selectRadio(a)
				}
				this.highlightRow(c);
				this.addSelection(b.key);
				this.writeSelections();
				this.fireRowSelectEvent(b.key, "rowSelectRadio")
			},
			selectRowWithCheckbox : function(b, a) {
				var d = b.closest("tr"), c = this.getRowMeta(d);
				this.highlightRow(d);
				if (!this.cfg.nativeElements) {
					this.selectCheckbox(b)
				}
				this.addSelection(c.key);
				this.writeSelections();
				if (!a) {
					this.updateHeaderCheckbox();
					this.fireRowSelectEvent(c.key, "rowSelectCheckbox")
				}
			},
			unselectRowWithCheckbox : function(b, a) {
				var d = b.closest("tr"), c = this.getRowMeta(d);
				this.unhighlightRow(d);
				if (!this.cfg.nativeElements) {
					this.unselectCheckbox(b)
				}
				this.removeSelection(c.key);
				this.uncheckHeaderCheckbox();
				this.writeSelections();
				if (!a) {
					this.fireRowUnselectEvent(c.key, "rowUnselectCheckbox")
				}
			},
			unselectAllRows : function() {
				var c = this.tbody.children("tr.ui-state-highlight"), a = this
						.isCheckboxSelectionEnabled(), e = this
						.isRadioSelectionEnabled();
				for (var b = 0; b < c.length; b++) {
					var d = c.eq(b);
					this.unhighlightRow(d);
					if (a) {
						if (this.cfg.nativeElements) {
							d.children("td.ui-selection-column").find(
									":checkbox").prop("checked", false)
						} else {
							this.unselectCheckbox(d.children(
									"td.ui-selection-column").find(
									"> div.ui-chkbox > div.ui-chkbox-box"))
						}
					} else {
						if (e) {
							if (this.cfg.nativeElements) {
								d.children("td.ui-selection-column").find(
										":radio").prop("checked", false)
							} else {
								this
										.unselectRadio(d
												.children(
														"td.ui-selection-column")
												.find(
														"> div.ui-radiobutton > div.ui-radiobutton-box"))
							}
						}
					}
				}
				if (a) {
					this.uncheckHeaderCheckbox()
				}
				this.selection = [];
				this.writeSelections()
			},
			selectAllRowsOnPage : function() {
				var b = this.tbody.children("tr");
				for (var a = 0; a < b.length; a++) {
					var c = b.eq(a);
					this.selectRow(c, true)
				}
			},
			unselectAllRowsOnPage : function() {
				var b = this.tbody.children("tr");
				for (var a = 0; a < b.length; a++) {
					var c = b.eq(a);
					this.unselectRow(c, true)
				}
			},
			selectAllRows : function() {
				this.selectAllRowsOnPage();
				this.selection = new Array("@all");
				this.writeSelections()
			},
			toggleCheckAll : function() {
				if (this.cfg.nativeElements) {
					var d = this.tbody
							.find("> tr.ui-datatable-selectable > td.ui-selection-column > :checkbox"), c = this.checkAllToggler
							.prop("checked"), e = this;
					d.each(function() {
						if (c) {
							var f = $(this);
							f.prop("checked", true);
							e.selectRowWithCheckbox(f, true)
						} else {
							var f = $(this);
							f.prop("checked", false);
							e.unselectRowWithCheckbox(f, true)
						}
					})
				} else {
					var d = this.tbody
							.find("> tr.ui-datatable-selectable > td.ui-selection-column .ui-chkbox-box"), c = this.checkAllToggler
							.hasClass("ui-state-active"), e = this;
					if (c) {
						this.checkAllToggler.removeClass("ui-state-active")
								.children("span.ui-chkbox-icon").addClass(
										"ui-icon-blank").removeClass(
										"ui-icon-check");
						d.each(function() {
							e.unselectRowWithCheckbox($(this), true)
						})
					} else {
						this.checkAllToggler.addClass("ui-state-active")
								.children("span.ui-chkbox-icon").removeClass(
										"ui-icon-blank").addClass(
										"ui-icon-check");
						d.each(function() {
							e.selectRowWithCheckbox($(this), true)
						})
					}
				}
				this.writeSelections();
				if (this.cfg.behaviors) {
					var a = this.cfg.behaviors.toggleSelect;
					if (a) {
						var b = {
							params : [ {
								name : this.id + "_checked",
								value : !c
							} ]
						};
						a.call(this, b)
					}
				}
			},
			selectCheckbox : function(a) {
				if (!a.hasClass("ui-state-focus")) {
					a.addClass("ui-state-active")
				}
				a.children("span.ui-chkbox-icon:first").removeClass(
						"ui-icon-blank").addClass(" ui-icon-check");
				a.prev().children("input").prop("checked", true)
			},
			unselectCheckbox : function(a) {
				a.removeClass("ui-state-active");
				a.children("span.ui-chkbox-icon:first").addClass(
						"ui-icon-blank").removeClass("ui-icon-check");
				a.prev().children("input").prop("checked", false)
			},
			selectRadio : function(a) {
				a.removeClass("ui-state-hover");
				if (!a.hasClass("ui-state-focus")) {
					a.addClass("ui-state-active")
				}
				a.children(".ui-radiobutton-icon").addClass("ui-icon-bullet")
						.removeClass("ui-icon-blank");
				a.prev().children("input").prop("checked", true)
			},
			unselectRadio : function(a) {
				a.removeClass("ui-state-active").children(
						".ui-radiobutton-icon").addClass("ui-icon-blank")
						.removeClass("ui-icon-bullet");
				a.prev().children("input").prop("checked", false)
			},
			toggleExpansion : function(b) {
				var d = b.closest("tr"), e = this.getRowMeta(d).index, a = b
						.hasClass("ui-icon-circle-triangle-s"), c = this;
				if ($.inArray(e, this.expansionProcess) === -1) {
					this.expansionProcess.push(e);
					if (a) {
						b.addClass("ui-icon-circle-triangle-e").removeClass(
								"ui-icon-circle-triangle-s");
						this.collapseRow(d);
						c.expansionProcess = $.grep(c.expansionProcess,
								function(f) {
									return (f !== e)
								});
						this.fireRowCollapseEvent(d)
					} else {
						if (this.cfg.rowExpandMode === "single") {
							this.collapseAllRows()
						}
						d.addClass("ui-expanded-row");
						b.addClass("ui-icon-circle-triangle-s").removeClass(
								"ui-icon-circle-triangle-e");
						this.loadExpandedRowContent(d)
					}
				}
			},
			loadExpandedRowContent : function(d) {
				var c = this, e = this.getRowMeta(d).index, a = {
					source : this.id,
					process : this.id,
					update : this.id,
					formId : this.cfg.formId,
					params : [ {
						name : this.id + "_rowExpansion",
						value : true
					}, {
						name : this.id + "_expandedRowIndex",
						value : e
					}, {
						name : this.id + "_encodeFeature",
						value : true
					}, {
						name : this.id + "_skipChildren",
						value : true
					} ],
					onsuccess : function(h, f, g) {
						PrimeFaces.ajax.Response.handle(h, f, g, {
							widget : c,
							handle : function(i) {
								this.displayExpandedRow(d, i)
							}
						});
						return true
					},
					oncomplete : function() {
						c.expansionProcess = $.grep(c.expansionProcess,
								function(f) {
									return f !== e
								})
					}
				};
				if (this.hasBehavior("rowToggle")) {
					var b = this.cfg.behaviors.rowToggle;
					b.call(this, a)
				} else {
					PrimeFaces.ajax.AjaxRequest(a)
				}
			},
			displayExpandedRow : function(b, a) {
				b.after(a);
				b.next().fadeIn()
			},
			fireRowCollapseEvent : function(c) {
				var d = this.getRowMeta(c).index;
				if (this.hasBehavior("rowToggle")) {
					var a = {
						params : [ {
							name : this.id + "_collapsedRowIndex",
							value : d
						} ]
					};
					var b = this.cfg.behaviors.rowToggle;
					b.call(this, a)
				}
			},
			collapseRow : function(a) {
				a.removeClass("ui-expanded-row").next().remove()
			},
			collapseAllRows : function() {
				var a = this;
				this
						.getExpandedRows()
						.each(
								function() {
									var f = $(this);
									a.collapseRow(f);
									var c = f.children("td");
									for (var b = 0; b < c.length; b++) {
										var d = c.eq(b), e = d
												.children(".ui-row-toggler");
										if (e.length > 0) {
											e
													.addClass(
															"ui-icon-circle-triangle-e")
													.removeClass(
															"ui-icon-circle-triangle-s");
											break
										}
									}
								})
			},
			getExpandedRows : function() {
				return this.tbody.children(".ui-expanded-row")
			},
			bindEditEvents : function() {
				var c = this;
				this.cfg.cellSeparator = this.cfg.cellSeparator || " ";
				if (this.cfg.editMode === "row") {
					var a = "> tr > td > div.ui-row-editor";
					this.tbody.off("click.datatable", a).on("click.datatable",
							a, null, function(f) {
								var d = $(f.target), g = d.closest("tr");
								if (d.hasClass("ui-icon-pencil")) {
									c.switchToRowEdit(g);
									d.hide().siblings().show()
								} else {
									if (d.hasClass("ui-icon-check")) {
										c.saveRowEdit(g)
									} else {
										if (d.hasClass("ui-icon-close")) {
											c.cancelRowEdit(g)
										}
									}
								}
							})
				} else {
					if (this.cfg.editMode === "cell") {
						var b = "> tr > td.ui-editable-column";
						this.tbody.off("click.datatable-cell", b).on(
								"click.datatable-cell", b, null, function(f) {
									c.incellClick = true;
									var d = $(this);
									if (!d.hasClass("ui-cell-editing")) {
										c.showCellEditor($(this))
									}
								});
						$(document).off("click.datatable-cell-blur" + this.id)
								.on(
										"click.datatable-cell-blur" + this.id,
										function(d) {
											if (!c.incellClick && c.currentCell
													&& !c.contextMenuClick) {
												c.saveCell(c.currentCell)
											}
											c.incellClick = false;
											c.contextMenuClick = false
										})
					}
				}
			},
			switchToRowEdit : function(c) {
				this.showRowEditors(c);
				if (this.hasBehavior("rowEditInit")) {
					var b = this.cfg.behaviors.rowEditInit, d = this
							.getRowMeta(c).index;
					var a = {
						params : [ {
							name : this.id + "_rowEditIndex",
							value : d
						} ]
					};
					b.call(this, a)
				}
			},
			showRowEditors : function(a) {
				a.addClass("ui-state-highlight ui-row-editing").children(
						"td.ui-editable-column").each(function() {
					var b = $(this);
					b.find(".ui-cell-editor-output").hide();
					b.find(".ui-cell-editor-input").show()
				})
			},
			showCellEditor : function(g) {
				this.incellClick = true;
				var k = null, h = this;
				if (g) {
					k = g;
					if (this.contextMenuCell) {
						this.contextMenuCell.parent().removeClass(
								"ui-state-highlight")
					}
				} else {
					k = this.contextMenuCell
				}
				if (this.currentCell) {
					h.saveCell(this.currentCell)
				}
				this.currentCell = k;
				var b = k.children("div.ui-cell-editor"), a = b
						.children("div.ui-cell-editor-output"), l = b
						.children("div.ui-cell-editor-input"), e = l
						.find(":input:enabled"), f = e.length > 1;
				k.addClass("ui-state-highlight ui-cell-editing");
				a.hide();
				l.show();
				e.eq(0).focus().select();
				if (f) {
					var j = [];
					for (var d = 0; d < e.length; d++) {
						j.push(e.eq(d).val())
					}
					k.data("multi-edit", true);
					k.data("old-value", j)
				} else {
					k.data("multi-edit", false);
					k.data("old-value", e.eq(0).val())
				}
				if (!k.data("edit-events-bound")) {
					k.data("edit-events-bound", true);
					e
							.on(
									"keydown.datatable-cell",
									function(o) {
										var n = $.ui.keyCode, m = o.shiftKey, i = o.which, c = $(this);
										if (i === n.ENTER
												|| i == n.NUMPAD_ENTER) {
											h.saveCell(k);
											o.preventDefault()
										} else {
											if (i === n.TAB) {
												if (f) {
													var p = m ? c.index() - 1
															: c.index() + 1;
													if (p < 0
															|| (p === e.length)) {
														h.tabCell(k, !m)
													} else {
														e.eq(p).focus()
													}
												} else {
													h.tabCell(k, !m)
												}
												o.preventDefault()
											}
										}
									})
							.on("focus.datatable-cell click.datatable-cell",
									function(c) {
										h.currentCell = k
									})
				}
			},
			tabCell : function(a, d) {
				var b = d ? a.next() : a.prev();
				if (b.length == 0) {
					var c = d ? a.parent().next() : a.parent().prev();
					b = d ? c.children("td.ui-editable-column:first") : c
							.children("td.ui-editable-column:last")
				}
				this.showCellEditor(b)
			},
			saveCell : function(a) {
				var c = a.find("div.ui-cell-editor-input :input:enabled"), f = false, e = this;
				if (a.data("multi-edit")) {
					var b = a.data("old-value");
					for (var d = 0; d < c.length; d++) {
						if (c.eq(d).val() != b[d]) {
							f = true;
							break
						}
					}
				} else {
					f = (c.eq(0).val() != a.data("old-value"))
				}
				if (f) {
					e.doCellEditRequest(a)
				} else {
					e.viewMode(a)
				}
				this.currentCell = null
			},
			viewMode : function(a) {
				var b = a.children("div.ui-cell-editor"), d = b
						.children("div.ui-cell-editor-input"), c = b
						.children("div.ui-cell-editor-output");
				a
						.removeClass("ui-cell-editing ui-state-error ui-state-highlight");
				c.show();
				d.hide();
				a.removeData("old-value").removeData("multi-edit")
			},
			doCellEditRequest : function(a) {
				var h = this.getRowMeta(a.closest("tr")), e = a
						.children(".ui-cell-editor"), f = e.attr("id"), d = a
						.index(), c = h.index + "," + d, g = this;
				var b = {
					source : this.id,
					process : this.id,
					update : this.id,
					params : [ {
						name : this.id + "_encodeFeature",
						value : true
					}, {
						name : this.id + "_cellInfo",
						value : c
					}, {
						name : f,
						value : f
					} ],
					onsuccess : function(k, i, j) {
						PrimeFaces.ajax.Response.handle(k, i, j, {
							widget : g,
							handle : function(l) {
								e.children(".ui-cell-editor-output").html(l)
							}
						});
						return true
					},
					oncomplete : function(k, i, j) {
						if (j.validationFailed) {
							a.addClass("ui-state-error")
						} else {
							g.viewMode(a)
						}
					}
				};
				if (this.hasBehavior("cellEdit")) {
					this.cfg.behaviors.cellEdit.call(this, b)
				} else {
					PrimeFaces.ajax.Request.handle(b)
				}
			},
			saveRowEdit : function(a) {
				this.doRowEditRequest(a, "save")
			},
			cancelRowEdit : function(a) {
				this.doRowEditRequest(a, "cancel")
			},
			doRowEditRequest : function(a, d) {
				var f = a.closest("tr"), g = this.getRowMeta(f).index, b = f
						.hasClass("ui-expanded-row"), e = this, c = {
					source : this.id,
					process : this.id,
					update : this.id,
					formId : this.cfg.formId,
					params : [ {
						name : this.id + "_rowEditIndex",
						value : this.getRowMeta(f).index
					}, {
						name : this.id + "_rowEditAction",
						value : d
					}, {
						name : this.id + "_encodeFeature",
						value : true
					} ],
					onsuccess : function(j, h, i) {
						PrimeFaces.ajax.Response.handle(j, h, i, {
							widget : e,
							handle : function(k) {
								if (b) {
									this.collapseRow(f)
								}
								this.updateRow(f, k)
							}
						});
						return true
					},
					oncomplete : function(j, h, i) {
						if (i && i.validationFailed) {
							e.invalidateRow(g)
						}
					}
				};
				if (d === "save") {
					this.getRowEditors(f).each(function() {
						c.params.push({
							name : this.id,
							value : this.id
						})
					})
				}
				if (d === "save" && this.hasBehavior("rowEdit")) {
					this.cfg.behaviors.rowEdit.call(this, c)
				} else {
					if (d === "cancel" && this.hasBehavior("rowEditCancel")) {
						this.cfg.behaviors.rowEditCancel.call(this, c)
					} else {
						PrimeFaces.ajax.Request.handle(c)
					}
				}
			},
			updateRow : function(b, a) {
				b.replaceWith(a)
			},
			invalidateRow : function(a) {
				this.tbody.children("tr").eq(a).addClass(
						"ui-widget-content ui-row-editing ui-state-error")
			},
			getRowEditors : function(a) {
				return a.find("div.ui-cell-editor")
			},
			getPaginator : function() {
				return this.paginator
			},
			writeSelections : function() {
				$(this.selectionHolder).val(this.selection.join(","))
			},
			isSingleSelection : function() {
				return this.cfg.selectionMode == "single"
			},
			isMultipleSelection : function() {
				return this.cfg.selectionMode == "multiple"
						|| this.isCheckboxSelectionEnabled()
			},
			clearSelection : function() {
				this.selection = [];
				$(this.selectionHolder).val("")
			},
			isSelectionEnabled : function() {
				return this.cfg.selectionMode != undefined
						|| this.cfg.columnSelectionMode != undefined
			},
			isCheckboxSelectionEnabled : function() {
				return this.cfg.selectionMode === "checkbox"
			},
			isRadioSelectionEnabled : function() {
				return this.cfg.selectionMode === "radio"
			},
			clearFilters : function() {
				this.thead.find(
						"> tr > th.ui-filter-column > .ui-column-filter").val(
						"");
				$(this.jqId + "\\:globalFilter").val("");
				this.filter()
			},
			setupResizableColumns : function() {
				this.fixColumnWidths();
				if (!this.cfg.liveResize) {
					this.resizerHelper = $(
							'<div class="ui-column-resizer-helper ui-state-highlight"></div>')
							.appendTo(this.jq)
				}
				this.addResizers();
				var a = this.thead.find("> tr > th > span.ui-column-resizer"), b = this;
				a.draggable({
					axis : "x",
					start : function() {
						if (b.cfg.liveResize) {
							b.jq.css("cursor", "col-resize")
						} else {
							var c = b.cfg.scrollable ? b.scrollBody.height()
									: b.thead.parent().height()
											- b.thead.height() - 1;
							b.resizerHelper.height(c);
							b.resizerHelper.show()
						}
					},
					drag : function(c, d) {
						if (b.cfg.liveResize) {
							b.resize(c, d)
						} else {
							b.resizerHelper.offset({
								left : d.helper.offset().left
										+ d.helper.width() / 2,
								top : b.thead.offset().top + b.thead.height()
							})
						}
					},
					stop : function(d, f) {
						var e = f.helper.parent();
						f.helper.css({
							left : "",
							top : "0px"
						});
						if (b.cfg.liveResize) {
							b.jq.css("cursor", "default")
						} else {
							b.resize(d, f);
							b.resizerHelper.hide()
						}
						var c = {
							source : b.id,
							process : b.id,
							params : [ {
								name : b.id + "_colResize",
								value : true
							}, {
								name : b.id + "_columnId",
								value : e.attr("id")
							}, {
								name : b.id + "_width",
								value : e.width()
							}, {
								name : b.id + "_height",
								value : e.height()
							} ]
						};
						if (b.hasBehavior("colResize")) {
							b.cfg.behaviors.colResize.call(b, c)
						}
						if (b.cfg.stickyHeader) {
							b.thead.find(".ui-column-filter").prop("disabled",
									false);
							b.clone = b.thead.clone(true);
							b.cloneContainer.find("thead").remove();
							b.cloneContainer.children("table").append(b.clone);
							b.thead.find(".ui-column-filter").prop("disabled",
									true)
						}
					},
					containment : this.jq
				})
			},
			addResizers : function() {
				this.thead.find("> tr > th.ui-resizable-column").prepend(
						'<span class="ui-column-resizer">&nbsp;</span>')
						.filter(":last-child").children(
								"span.ui-column-resizer").hide()
			},
			resize : function(a, i) {
				var c = i.helper.parent(), e = c.next(), h = null, d = null, f = null;
				if (this.cfg.liveResize) {
					h = c.outerWidth() - (a.pageX - c.offset().left), d = (c
							.width() - h), f = (e.width() + h)
				} else {
					h = (i.position.left - i.originalPosition.left), d = (c
							.width() + h), f = (e.width() - h)
				}
				if (d > 15 && f > 15) {
					c.width(d);
					e.width(f);
					var j = c.index();
					if (this.cfg.scrollable) {
						this.theadClone.find(
								PrimeFaces.escapeClientId(c.attr("id")
										+ "_clone")).width(d);
						this.theadClone.find(
								PrimeFaces.escapeClientId(e.attr("id")
										+ "_clone")).width(f);
						if (this.footerCols.length > 0) {
							var g = this.footerCols.eq(j), b = g.next();
							g.width(d);
							b.width(f)
						}
					}
				}
			},
			hasBehavior : function(a) {
				if (this.cfg.behaviors) {
					return this.cfg.behaviors[a] != undefined
				}
				return false
			},
			removeSelection : function(a) {
				this.selection = $.grep(this.selection, function(b) {
					return b != a
				})
			},
			addSelection : function(a) {
				if (!this.isSelected(a)) {
					this.selection.push(a)
				}
			},
			isSelected : function(a) {
				return PrimeFaces.inArray(this.selection, a)
			},
			getRowMeta : function(b) {
				var a = {
					index : b.data("ri"),
					key : b.attr("data-rk")
				};
				return a
			},
			setupDraggableColumns : function() {
				this.orderStateHolder = $(this.jqId + "_columnOrder");
				this.saveColumnOrder();
				this.dragIndicatorTop = $(
						'<span class="ui-icon ui-icon-arrowthick-1-s" style="position:absolute"/></span>')
						.hide().appendTo(this.jq);
				this.dragIndicatorBottom = $(
						'<span class="ui-icon ui-icon-arrowthick-1-n" style="position:absolute"/></span>')
						.hide().appendTo(this.jq);
				var a = this;
				$(this.jqId + " thead th")
						.draggable(
								{
									appendTo : "body",
									opacity : 0.75,
									cursor : "move",
									scope : this.id,
									cancel : ":input,.ui-column-resizer",
									drag : function(e, g) {
										var i = g.helper
												.data("droppable-column");
										if (i) {
											var d = i.offset(), b = d.top - 10, c = d.top
													+ i.height() + 8, f = null;
											if (e.originalEvent.pageX >= d.left
													+ (i.width() / 2)) {
												var h = i.next();
												if (h.length == 1) {
													f = h.offset().left - 9
												} else {
													f = i.offset().left
															+ i.innerWidth()
															- 9
												}
												g.helper.data("drop-location",
														1)
											} else {
												f = d.left - 9;
												g.helper.data("drop-location",
														-1)
											}
											a.dragIndicatorTop.offset({
												left : f,
												top : b - 3
											}).show();
											a.dragIndicatorBottom.offset({
												left : f,
												top : c - 3
											}).show()
										}
									},
									stop : function(b, c) {
										a.dragIndicatorTop.css({
											left : 0,
											top : 0
										}).hide();
										a.dragIndicatorBottom.css({
											left : 0,
											top : 0
										}).hide()
									},
									helper : function() {
										var c = $(this), b = $('<div class="ui-widget ui-state-default" style="padding:4px 10px;text-align:center;"></div>');
										b.width(c.width());
										b.height(c.height());
										b.html(c.html());
										return b.get(0)
									}
								})
						.droppable(
								{
									hoverClass : "ui-state-highlight",
									tolerance : "pointer",
									scope : this.id,
									over : function(b, c) {
										c.helper.data("droppable-column",
												$(this))
									},
									drop : function(g, h) {
										var c = h.draggable, f = h.helper
												.data("drop-location"), e = $(this);
										var b = a.tbody
												.find("> tr > td:nth-child("
														+ (c.index() + 1) + ")"), d = a.tbody
												.find("> tr > td:nth-child("
														+ (e.index() + 1) + ")");
										if (f > 0) {
											if (a.cfg.resizableColumns) {
												if (e.next().length == 0) {
													e
															.children(
																	"span.ui-column-resizer")
															.show();
													c
															.children(
																	"span.ui-column-resizer")
															.hide()
												}
											}
											c.insertAfter(e);
											b.each(function(j, k) {
												$(this).insertAfter(d.eq(j))
											})
										} else {
											c.insertBefore(e);
											b.each(function(j, k) {
												$(this).insertBefore(d.eq(j))
											})
										}
										if (a.cfg.scrollable) {
											a.columnWidthsFixed = false;
											a.fixColumnWidths()
										}
										a.saveColumnOrder();
										if (a.cfg.behaviors) {
											var i = a.cfg.behaviors.colReorder;
											if (i) {
												i.call(a)
											}
										}
									}
								})
			},
			saveColumnOrder : function() {
				var a = [], b = $(this.jqId + " thead:first th");
				b.each(function(c, d) {
					a.push($(d).attr("id"))
				});
				this.orderStateHolder.val(a.join(","))
			},
			makeRowsDraggable : function() {
				var a = this;
				this.tbody
						.sortable({
							placeholder : "ui-datatable-rowordering ui-state-active",
							cursor : "move",
							handle : "td,span:not(.ui-c)",
							appendTo : document.body,
							helper : function(g, h) {
								var d = h.children(), f = $('<div class="ui-datatable ui-widget"><table><tbody></tbody></table></div>'), c = h
										.clone(), b = c.children();
								for (var e = 0; e < b.length; e++) {
									b.eq(e).width(d.eq(e).width())
								}
								c.appendTo(f.find("tbody"));
								return f
							},
							update : function(d, e) {
								var c = e.item.data("ri"), f = a.paginator ? a.paginator
										.getFirst()
										+ e.item.index()
										: e.item.index();
								a.syncRowParity();
								var b = {
									source : a.id,
									process : a.id,
									params : [ {
										name : a.id + "_rowreorder",
										value : true
									}, {
										name : a.id + "_fromIndex",
										value : c
									}, {
										name : a.id + "_toIndex",
										value : f
									}, {
										name : this.id + "_skipChildren",
										value : true
									} ]
								};
								if (a.hasBehavior("rowReorder")) {
									a.cfg.behaviors.rowReorder.call(a, b)
								} else {
									PrimeFaces.ajax.Request.handle(b)
								}
							}
						})
			},
			syncRowParity : function() {
				var b = this.tbody.children("tr.ui-widget-content"), d = this.paginator ? this.paginator
						.getFirst()
						: 0;
				for (var a = d; a < b.length; a++) {
					var c = b.eq(a);
					c.data("ri", a).removeClass(
							"ui-datatable-even ui-datatable-odd");
					if (a % 2 === 0) {
						c.addClass("ui-datatable-even")
					} else {
						c.addClass("ui-datatable-odd")
					}
				}
			},
			isEmpty : function() {
				return this.tbody.children("tr.ui-datatable-empty-message").length === 1
			},
			getSelectedRowsCount : function() {
				return this.isSelectionEnabled() ? this.selection.length : 0
			},
			updateHeaderCheckbox : function() {
				if (this.isEmpty()) {
					this.uncheckHeaderCheckbox();
					this.disableHeaderCheckbox()
				} else {
					var b, d, c, a;
					if (this.cfg.nativeElements) {
						b = this.tbody
								.find("> tr > td.ui-selection-column > :checkbox");
						c = b.filter(":enabled");
						a = b.filter(":disabled");
						d = c.filter(":checked")
					} else {
						b = this.tbody
								.find("> tr > td.ui-selection-column .ui-chkbox-box");
						c = b.filter(":not(.ui-state-disabled)");
						a = b.filter(".ui-state-disabled");
						d = c.filter(".ui-state-active")
					}
					if (c.length && c.length === d.length) {
						this.checkHeaderCheckbox()
					} else {
						this.uncheckHeaderCheckbox()
					}
					if (b.length === a.length) {
						this.disableHeaderCheckbox()
					} else {
						this.enableHeaderCheckbox()
					}
				}
			},
			checkHeaderCheckbox : function() {
				if (this.cfg.nativeElements) {
					this.checkAllToggler.prop("checked", true)
				} else {
					this.checkAllToggler.addClass("ui-state-active").children(
							"span.ui-chkbox-icon").removeClass("ui-icon-blank")
							.addClass("ui-icon-check")
				}
			},
			uncheckHeaderCheckbox : function() {
				if (this.cfg.nativeElements) {
					this.checkAllToggler.prop("checked", false)
				} else {
					this.checkAllToggler.removeClass("ui-state-active")
							.children("span.ui-chkbox-icon").addClass(
									"ui-icon-blank").removeClass(
									"ui-icon-check")
				}
			},
			disableHeaderCheckbox : function() {
				if (this.cfg.nativeElements) {
					this.checkAllToggler.prop("disabled", true)
				} else {
					this.checkAllToggler.addClass("ui-state-disabled")
				}
			},
			enableHeaderCheckbox : function() {
				if (this.cfg.nativeElements) {
					this.checkAllToggler.prop("disabled", false)
				} else {
					this.checkAllToggler.removeClass("ui-state-disabled")
				}
			},
			setupStickyHeader : function() {
				var b = this.thead.parent(), f = b.offset(), d = $(window), c = this, e = "scroll."
						+ this.id, a = "resize.sticky-" + this.id;
				this.cloneContainer = $('<div class="ui-datatable ui-datatable-sticky ui-widget"><table></table></div>');
				this.clone = this.thead.clone(true);
				this.cloneContainer.children("table").append(this.clone);
				this.cloneContainer.css({
					position : "absolute",
					width : b.outerWidth(),
					top : f.top,
					left : f.left,
					"z-index" : ++PrimeFaces.zindex
				}).appendTo(this.jq);
				d.off(e).on(
						e,
						function() {
							var h = d.scrollTop(), g = b.offset();
							if (h > g.top) {
								c.cloneContainer.css("top", h).addClass(
										"ui-shadow ui-sticky");
								if (h >= (g.top + c.tbody.height())) {
									c.cloneContainer.hide()
								} else {
									c.cloneContainer.show()
								}
							} else {
								c.cloneContainer.css("top", g.top).removeClass(
										"ui-shadow ui-sticky")
							}
						}).off(a).on(a, function() {
					c.cloneContainer.width(b.outerWidth())
				});
				this.thead.find(".ui-column-filter").prop("disabled", true)
			}
		});
PrimeFaces.widget.FrozenDataTable = PrimeFaces.widget.DataTable
		.extend({
			setupScrolling : function() {
				this.scrollLayout = this.jq
						.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right");
				this.frozenLayout = this.jq
						.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left");
				this.scrollContainer = this.jq
						.find("> table > tbody > tr > td.ui-datatable-frozenlayout-right > .ui-datatable-scrollable-container");
				this.frozenContainer = this.jq
						.find("> table > tbody > tr > td.ui-datatable-frozenlayout-left > .ui-datatable-frozen-container");
				this.scrollHeader = this.scrollContainer
						.children(".ui-datatable-scrollable-header");
				this.scrollHeaderBox = this.scrollHeader
						.children("div.ui-datatable-scrollable-header-box");
				this.scrollBody = this.scrollContainer
						.children(".ui-datatable-scrollable-body");
				this.scrollFooter = this.scrollContainer
						.children(".ui-datatable-scrollable-footer");
				this.scrollFooterBox = this.scrollFooter
						.children("div.ui-datatable-scrollable-footer-box");
				this.scrollStateHolder = $(this.jqId + "_scrollState");
				this.scrollHeaderTable = this.scrollHeaderBox.children("table");
				this.scrollBodyTable = this.scrollBody.children("table");
				this.scrollThead = this.thead.eq(1);
				this.scrollTbody = this.tbody.eq(1);
				this.scrollFooterTable = this.scrollFooter.children("table");
				this.scrollFooterCols = this.scrollFooter
						.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
				this.frozenHeader = this.frozenContainer
						.children(".ui-datatable-scrollable-header");
				this.frozenBody = this.frozenContainer
						.children(".ui-datatable-scrollable-body");
				this.frozenBodyTable = this.frozenBody.children("table");
				this.frozenThead = this.thead.eq(0);
				this.frozenTbody = this.tbody.eq(0);
				this.frozenFooter = this.frozenContainer
						.children(".ui-datatable-scrollable-footer");
				this.frozenFooterCols = this.frozenFooter
						.find("> .ui-datatable-scrollable-footer-box > table > tfoot > tr > td");
				this.percentageScrollHeight = this.cfg.scrollHeight
						&& (this.cfg.scrollHeight.indexOf("%") !== -1);
				this.percentageScrollWidth = this.cfg.scrollWidth
						&& (this.cfg.scrollWidth.indexOf("%") !== -1);
				this.frozenThead.find("> tr > th").addClass("ui-frozen-column");
				var f = this, d = this.getScrollbarWidth() + "px";
				if (this.cfg.scrollHeight) {
					if (this.percentageScrollHeight) {
						this.adjustScrollHeight()
					}
					if (this.hasVerticalOverflow()) {
						this.scrollHeaderBox.css("margin-right", d);
						this.scrollFooterBox.css("margin-right", d)
					}
				}
				this.fixColumnWidths();
				if (this.cfg.scrollWidth) {
					if (this.percentageScrollWidth) {
						this.adjustScrollWidth()
					} else {
						this.setScrollWidth(parseInt(this.cfg.scrollWidth))
					}
					if (this.hasVerticalOverflow()) {
						if (PrimeFaces.browser.webkit === true) {
							this.frozenBody.append('<div style="height:' + d
									+ ';border:1px solid transparent"></div>')
						} else {
							if (PrimeFaces.isIE(8)) {
								this.frozenBody.append('<div style="height:'
										+ d + '"></div>')
							} else {
								this.frozenBodyTable.css("margin-bottom", d)
							}
						}
					}
				}
				this.cloneHead();
				var b = this.frozenThead.height(), a = this.scrollThead
						.height(), e = Math.max(b, a);
				this.scrollThead.height(e);
				this.frozenThead.height(e);
				this.restoreScrollState();
				if (this.cfg.liveScroll) {
					this.scrollOffset = this.cfg.scrollStep;
					this.shouldLiveScroll = true
				}
				this.scrollBody
						.scroll(function() {
							var j = f.scrollBody.scrollLeft(), i = f.scrollBody
									.scrollTop();
							f.scrollHeaderBox.css("margin-left", -j);
							f.scrollFooterBox.css("margin-left", -j);
							f.frozenBody.scrollTop(i);
							if (f.shouldLiveScroll) {
								var i = this.scrollTop, h = this.scrollHeight, g = this.clientHeight;
								if (i >= (h - (g))) {
									f.loadLiveRows()
								}
							}
							f.saveScrollState()
						});
				var c = "resize." + this.id;
				$(window).unbind(c).bind(c, function() {
					if (f.jq.is(":visible")) {
						if (f.percentageScrollHeight) {
							f.adjustScrollHeight()
						}
						if (f.percentageScrollWidth) {
							f.adjustScrollWidth()
						}
					}
				})
			},
			cloneHead : function() {
				this.frozenTheadClone = this.frozenThead.clone();
				this.frozenTheadClone.find("th").each(function() {
					var a = $(this);
					a.attr("id", a.attr("id") + "_clone");
					$(this).children().not(".ui-column-title").remove()
				});
				this.frozenTheadClone.removeAttr("id").addClass(
						"ui-datatable-scrollable-theadclone").height(0)
						.prependTo(this.frozenBodyTable);
				this.scrollTheadClone = this.scrollThead.clone();
				this.scrollTheadClone.find("th").each(function() {
					var a = $(this);
					a.attr("id", a.attr("id") + "_clone");
					$(this).children().not(".ui-column-title").remove()
				});
				this.scrollTheadClone.removeAttr("id").addClass(
						"ui-datatable-scrollable-theadclone").height(0)
						.prependTo(this.scrollBodyTable)
			},
			hasVerticalOverflow : function() {
				return this.scrollBodyTable.outerHeight() > this.scrollBody
						.outerHeight()
			},
			adjustScrollHeight : function() {
				var d = this.jq.parent().innerHeight()
						* (parseInt(this.cfg.scrollHeight) / 100), f = this.jq
						.children(".ui-datatable-header").outerHeight(true), b = this.jq
						.children(".ui-datatable-footer").outerHeight(true), c = (this.scrollHeader
						.innerHeight() + this.scrollFooter.innerHeight()), e = this.paginator ? this.paginator
						.getContainerHeight(true)
						: 0, a = (d - (c + e + f + b));
				this.scrollBody.height(a);
				this.frozenBody.height(a)
			},
			adjustScrollWidth : function() {
				var a = parseInt((this.jq.parent().innerWidth() * (parseInt(this.cfg.scrollWidth) / 100)));
				this.setScrollWidth(a)
			},
			setScrollWidth : function(b) {
				var c = this, a = b + this.frozenLayout.width();
				this.jq.children(".ui-widget-header").each(function() {
					c.setOuterWidth($(this), a)
				});
				this.scrollHeader.width(b);
				this.scrollBody.css("margin-right", 0).width(b);
				this.scrollFooter.width(b)
			},
			fixColumnWidths : function() {
				if (!this.columnWidthsFixed) {
					if (PrimeFaces.isIE(7)) {
						this.bodyTable.css("width", "auto")
					}
					if (this.cfg.scrollable) {
						this._fixColumnWidths(this.scrollHeader,
								this.scrollFooterCols, this.scrollColgroup);
						this._fixColumnWidths(this.frozenHeader,
								this.frozenFooterCols, this.frozenColgroup)
					} else {
						this.jq
								.find(
										"> .ui-datatable-tablewrapper > table > thead > tr > th")
								.each(function() {
									var a = $(this);
									a.width(a.width())
								})
					}
					this.columnWidthsFixed = true
				}
			},
			_fixColumnWidths : function(b, a) {
				b
						.find(
								"> .ui-datatable-scrollable-header-box > table > thead > tr > th")
						.each(function() {
							var f = $(this), c = f.index(), d = f.width();
							f.width(d);
							if (a.length > 0) {
								var e = a.eq(c);
								e.width(d)
							}
						})
			},
			updateData : function(b, d) {
				var h = $("<table><tbody>" + b + "</tbody></table>"), k = h
						.find("> tbody > tr"), f = (d === undefined) ? true : d;
				if (f) {
					this.frozenTbody.children().remove();
					this.scrollTbody.children().remove()
				}
				for (var c = 0; c < k.length; c++) {
					var j = k.eq(c), a = j.children("td"), g = this.copyRow(j), e = this
							.copyRow(j);
					g.append(a.slice(0, this.cfg.frozenColumns));
					e.append(a.slice(this.cfg.frozenColumns));
					this.frozenTbody.append(g);
					this.scrollTbody.append(e)
				}
				this.postUpdateData()
			},
			copyRow : function(a) {
				return $("<tr></tr>").data("ri", a.data("ri")).addClass(
						a.attr("class")).attr("role", "row")
			},
			getThead : function() {
				return $(this.jqId + "_frozenThead," + this.jqId
						+ "_scrollableThead")
			},
			getTbody : function() {
				return $(this.jqId + "_frozenTbody," + this.jqId
						+ "_scrollableTbody")
			},
			bindRowHover : function() {
				var a = this;
				this.tbody.off("mouseover.datatable mouseout.datatable",
						this.rowSelector).on("mouseover.datatable",
						this.rowSelector, null, function() {
							var b = $(this), c = a.getTwinRow(b);
							if (!b.hasClass("ui-state-highlight")) {
								b.addClass("ui-state-hover");
								c.addClass("ui-state-hover")
							}
						}).on("mouseout.datatable", this.rowSelector, null,
						function() {
							var b = $(this), c = a.getTwinRow(b);
							if (!b.hasClass("ui-state-highlight")) {
								b.removeClass("ui-state-hover");
								c.removeClass("ui-state-hover")
							}
						})
			},
			getTwinRow : function(b) {
				var a = (this.tbody.index(b.parent()) === 0) ? this.tbody.eq(1)
						: this.tbody.eq(0);
				return a.children().eq(b.index())
			},
			highlightRow : function(a) {
				this._super(a);
				this._super(this.getTwinRow(a))
			},
			unhighlightRow : function(a) {
				this._super(a);
				this._super(this.getTwinRow(a))
			},
			displayExpandedRow : function(b, a) {
				var d = this.getTwinRow(b);
				b.after(a);
				var c = b.next();
				c.show();
				d
						.after('<tr class="ui-expanded-row-content ui-widget-content"><td></td></tr>');
				d.next().children("td")
						.attr("colspan", d.children("td").length).height(
								c.children("td").height())
			},
			collapseRow : function(a) {
				this._super(a);
				this._super(this.getTwinRow(a))
			},
			getExpandedRows : function() {
				return this.frozenTbody.children(".ui-expanded-row")
			},
			showRowEditors : function(a) {
				this._super(a);
				this._super(this.getTwinRow(a))
			},
			updateRow : function(g, e) {
				var d = $("<table><tbody>" + e + "</tbody></table>"), b = d
						.find("> tbody > tr"), c = b.children("td"), a = this
						.copyRow(b), f = this.copyRow(b), h = this
						.getTwinRow(g);
				a.append(c.slice(0, this.cfg.frozenColumns));
				f.append(c.slice(this.cfg.frozenColumns));
				g.replaceWith(a);
				h.replaceWith(f)
			},
			invalidateRow : function(a) {
				this.frozenTbody.children("tr").eq(a).addClass(
						"ui-widget-content ui-row-editing ui-state-error");
				this.scrollTbody.children("tr").eq(a).addClass(
						"ui-widget-content ui-row-editing ui-state-error")
			},
			getRowEditors : function(a) {
				return a.find("div.ui-cell-editor").add(
						this.getTwinRow(a).find("div.ui-cell-editor"))
			},
			addResizers : function() {
				this.frozenThead.find("> tr > th.ui-resizable-column").prepend(
						'<span class="ui-column-resizer">&nbsp;</span>')
						.filter(":last-child")
						.addClass("ui-frozen-column-last");
				this.scrollThead.find("> tr > th.ui-resizable-column").prepend(
						'<span class="ui-column-resizer">&nbsp;</span>')
						.filter(":last-child").children(
								"span.ui-column-resizer").hide()
			},
			resize : function(b, m) {
				var d = m.helper.parent(), g = d.next(), l = null, f = null, h = null, o = d
						.index(), k = d.hasClass("ui-frozen-column-last");
				if (this.cfg.liveResize) {
					l = d.outerWidth() - (b.pageX - d.offset().left), f = (d
							.width() - l), h = (g.width() + l)
				} else {
					l = (m.position.left - m.originalPosition.left), f = (d
							.width() + l), h = (g.width() - l)
				}
				var i = k ? (f > 15) : (f > 15 && h > 15);
				if (i) {
					if (k) {
						this.frozenLayout.width(this.frozenLayout.width() + l)
					}
					d.width(f);
					g.width(h);
					var n = d.hasClass("ui-frozen-column"), e = n ? this.frozenTheadClone
							: this.scrollTheadClone, a = n ? this.frozenFooterCols
							: this.scrollFooterCols;
					e.find(PrimeFaces.escapeClientId(d.attr("id") + "_clone"))
							.width(f);
					e.find(PrimeFaces.escapeClientId(g.attr("id") + "_clone"))
							.width(h);
					if (a.length > 0) {
						var j = a.eq(o), c = j.next();
						j.width(f);
						c.width(h)
					}
				}
			}
		});